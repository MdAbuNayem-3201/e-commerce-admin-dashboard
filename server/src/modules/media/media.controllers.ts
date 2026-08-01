import { MediaType } from "../../generated/prisma/enums.js";
import { Request, Response } from "express";

import prisma from "../../config/prisma.js";

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../../utils/cloudinary.js";


import {
  updateMediaSchema,
  uploadMediaSchema,
} from "./media.validation.js";


//Upload a file

export const uploadMedia = asyncHandler(
  async (req: Request, res: Response) => {
    uploadMediaSchema.parse(req.body);

    if (!req.file) {
      throw new ApiError(400, "File is required");
    }

    const uploadedFile = await uploadOnCloudinary(
      req.file.path
    );

    if (!uploadedFile) {
      throw new ApiError(
        500,
        "File upload failed"
      );
    }

    let mediaType: MediaType;

    if (req.file.mimetype.startsWith("image/")) {
      mediaType = MediaType.IMAGE;
    } else if (req.file.mimetype.startsWith("video/")) {
      mediaType = MediaType.VIDEO;
    } else {
      mediaType = MediaType.DOCUMENT;
    }

    const media = await prisma.media.create({
      data: {
        fileName: req.file.originalname,
        storedPath: uploadedFile.public_id,
        publicUrl: uploadedFile.secure_url,
        mimeType: req.file.mimetype,
        size: req.file.size,
        width: uploadedFile.width,
        height: uploadedFile.height,
        type: mediaType,
        title: req.body.title,
        altText: req.body.altText,
        uploadedById: req.user.id ,
      },
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        media,
        "Media uploaded successfully"
      )
    );
  }
);

//Upload multiple files
export const uploadMultipleMedia = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files)) {
      throw new ApiError(400, "Files are required");
    }

    const uploadedMedia = [];

    for (const file of req.files) {
      const uploadedFile = await uploadOnCloudinary(file.path);

      if (!uploadedFile) {
        continue;
      }

      let mediaType: MediaType;

      if (file.mimetype.startsWith("image/")) {
        mediaType = MediaType.IMAGE;
      } else if (file.mimetype.startsWith("video/")) {
        mediaType = MediaType.VIDEO;
      } else {
        mediaType = MediaType.DOCUMENT;
      }

      const media = await prisma.media.create({
        data: {
          fileName: file.originalname,
          storedPath: uploadedFile.public_id,
          publicUrl: uploadedFile.secure_url,
          mimeType: file.mimetype,
          size: file.size,
          width: uploadedFile.width,
          height: uploadedFile.height,
          type: mediaType,
          uploadedById: req.user.id,
        },
      });

      uploadedMedia.push(media);
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        uploadedMedia,
        "Files uploaded successfully"
      )
    );
  }
);


//Get all media

export const getMedia = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const search = req.query.search?.toString();

    const type = req.query.type as MediaType | undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          fileName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [media, total] = await prisma.$transaction([
      prisma.media.findMany({
        where,
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.media.count({
        where,
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          media,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Media fetched successfully"
      )
    );
  }
);


//Get media by id(single media)

export const getMediaById = asyncHandler(
  async (req: Request, res: Response) => {
    const media = await prisma.media.findUnique({
    
      where: {
        id: req.params.id as string,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!media) {
      throw new ApiError(404, "Media not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        media,
        "Media fetched successfully"
      )
    );
  }
);


//Update Media(title, altText)
export const updateMedia = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = updateMediaSchema.parse(req.body);

    const media = await prisma.media.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!media) {
      throw new ApiError(404, "Media not found");
    }

    const updatedMedia = await prisma.media.update({
      where: {
        id: req.params.id as string,
      },
      data: {
        title: payload.title,
        altText: payload.altText,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        updatedMedia,
        "Media updated successfully"
      )
    );
  }
);



//Delete a media
export const deleteMedia = asyncHandler(
  async (req: Request, res: Response) => {
    const media = await prisma.media.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!media) {
      throw new ApiError(404, "Media not found");
    }

    await deleteFromCloudinary(media.storedPath);

    await prisma.media.delete({
      where: {
        id: media.id,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Media deleted successfully"
      )
    );
  }
);


//watch media for real-time monitoring

export const watchMedia = asyncHandler(
  async (req: Request, res: Response) => {
    // Get total counts
    const totalMedia = await prisma.media.count();
    const totalImages = await prisma.media.count({
      where: { type: MediaType.IMAGE },
    });
    const totalVideos = await prisma.media.count({
      where: { type: MediaType.VIDEO },
    });
    const totalDocuments = await prisma.media.count({
      where: { type: MediaType.DOCUMENT },
    });

    // Get recent uploads (last 5)
    const recentUploads = await prisma.media.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get total storage size
    const storageStats = await prisma.media.aggregate({
      _sum: {
        size: true,
      },
    });
    const totalSizeInMB = ((storageStats._sum.size || 0) / (1024 * 1024)).toFixed(2);

    // Get orphaned media (not attached to anything)
    const orphanedMedia = await prisma.media.count({
      where: {
        attachments: {
          none: {},
        },
        categoryImageFor: {
          none: {},
        },
        brandLogoFor: {
          none: {},
        },
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalMedia,
          totalImages,
          totalVideos,
          totalDocuments,
          totalSizeMB: totalSizeInMB,
          orphanedMedia,
          recentUploads,
          timestamp: new Date().toISOString(),
        },
        "Media watch data fetched successfully"
      )
    );
  }
);