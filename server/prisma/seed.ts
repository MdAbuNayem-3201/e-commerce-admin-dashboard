// prisma/seed.ts
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../src/config/prisma.js";

dotenv.config();

const SALT_ROUNDS = 10;

// ==========================================================
// Section 4.3 of the assignment: every permission group + action.
// ==========================================================
const PERMISSION_MAP: Record<string, string[]> = {
  Dashboard: ["watch"],
  Permission: ["watch", "create", "read", "update", "delete"],
  Role: ["watch", "create", "read", "update", "delete"],
  User: ["watch", "create", "read", "update", "delete"],
  Media: ["watch", "read", "upload", "write", "delete"],
  Category: ["watch", "create", "read", "update", "delete"],
  Brand: ["watch", "create", "read", "update", "delete"],
  Attribute: ["watch", "create", "read", "update", "delete"],
  Product: ["watch", "create", "read", "update", "delete"],
};

// Modules the "catalog only" limited user is allowed to touch.
// Deliberately excludes Permission, Role, User, Dashboard, Media.
const CATALOG_MODULES = ["Category", "Brand", "Attribute", "Product"];

async function seedPermissions() {
  const allPermissionNames: string[] = [];

  for (const [groupName, actions] of Object.entries(PERMISSION_MAP)) {
    // Upsert permission group
    const group = await prisma.permissionGroup.upsert({
      where: { name: groupName },
      update: {
        description: `${groupName} module permissions`,
      },
      create: {
        name: groupName,
        description: `${groupName} module permissions`,
      },
    });

    // Create each permission in the group
    for (const action of actions) {
      const name = `${groupName.toLowerCase()}:${action}`;
      allPermissionNames.push(name);
      
      await prisma.permission.upsert({
        where: { name },
        update: {
          description: `${action} on ${groupName}`,
        },
        create: {
          name,
          description: `${action} on ${groupName}`,
          groupId: group.id,
        },
      });
    }
  }

  console.log(`✅ Seeded ${allPermissionNames.length} permissions across ${Object.keys(PERMISSION_MAP).length} groups`);
  return allPermissionNames;
}

async function seedSuperAdminRole() {
  const allPermissions = await prisma.permission.findMany({
    select: { id: true },
  });

  if (allPermissions.length === 0) {
    throw new Error("No permissions found! Run seedPermissions first.");
  }

  // Check if Super Admin role exists, if not create it
  let role = await prisma.role.findUnique({
    where: { name: "Super Admin" },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        name: "Super Admin",
        description: "Full, unrestricted access to every module and action",
        status: "ACTIVE",
      },
    });
  } else {
    // Update existing role
    role = await prisma.role.update({
      where: { name: "Super Admin" },
      data: {
        description: "Full, unrestricted access to every module and action",
        status: "ACTIVE",
      },
    });
  }

  // Reset and re-grant so re-running the seed always leaves the role holding
  // every permission currently defined.
  await prisma.rolePermission.deleteMany({
    where: { roleId: role.id },
  });

  // Create role-permission associations
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p) => ({
      roleId: role.id,
      permissionId: p.id,
    })),
  });

  console.log(`✅ Super Admin role holds ${allPermissions.length} permissions`);
  return role;
}

async function seedCatalogOnlyRole() {
  // Get catalog permissions (excluding Dashboard, Permission, Role, User, Media)
  const catalogPermissions = await prisma.permission.findMany({
    where: {
      group: {
        name: {
          in: CATALOG_MODULES,
        },
      },
    },
    select: { id: true },
  });

  if (catalogPermissions.length === 0) {
    throw new Error(`No catalog permissions found for modules: ${CATALOG_MODULES.join(', ')}`);
  }

  // Check if Catalog Manager role exists
  let role = await prisma.role.findUnique({
    where: { name: "Catalog Manager" },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        name: "Catalog Manager",
        description: "Catalog access only (Category, Brand, Attribute, Product). No Permission/Role/User/Dashboard/Media access.",
        status: "ACTIVE",
      },
    });
  } else {
    role = await prisma.role.update({
      where: { name: "Catalog Manager" },
      data: {
        description: "Catalog access only (Category, Brand, Attribute, Product). No Permission/Role/User/Dashboard/Media access.",
        status: "ACTIVE",
      },
    });
  }

  // Reset and re-grant
  await prisma.rolePermission.deleteMany({
    where: { roleId: role.id },
  });

  await prisma.rolePermission.createMany({
    data: catalogPermissions.map((p) => ({
      roleId: role.id,
      permissionId: p.id,
    })),
  });

  console.log(`✅ Catalog Manager role holds ${catalogPermissions.length} catalog-only permissions`);
  return role;
}

async function seedUsers(superAdminRoleId: string, catalogRoleId: string) {
  // Get credentials from environment variables with fallbacks
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@trendsbird.test";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
  const superAdminName = process.env.SUPER_ADMIN_NAME || "Super Admin";

  const catalogEmail = process.env.CATALOG_USER_EMAIL || "catalog@trendsbird.test";
  const catalogPassword = process.env.CATALOG_USER_PASSWORD || "Catalog@123";
  const catalogName = process.env.CATALOG_USER_NAME || "Catalog Viewer";

  const deactivatedEmail = process.env.DEACTIVATED_USER_EMAIL || "deactivated@trendsbird.test";
  const deactivatedPassword = process.env.DEACTIVATED_USER_PASSWORD || "Deactivated@123";

  // Hash passwords
  const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, SALT_ROUNDS);
  const hashedCatalogPassword = await bcrypt.hash(catalogPassword, SALT_ROUNDS);
  const hashedDeactivatedPassword = await bcrypt.hash(deactivatedPassword, SALT_ROUNDS);

  // Upsert Super Admin
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      roleId: superAdminRoleId,
      isActive: true,
      password: hashedSuperAdminPassword,
      name: superAdminName,
    },
    create: {
      name: superAdminName,
      email: superAdminEmail,
      password: hashedSuperAdminPassword,
      roleId: superAdminRoleId,
      isActive: true,
    },
  });

  // Upsert Catalog Manager
  await prisma.user.upsert({
    where: { email: catalogEmail },
    update: {
      roleId: catalogRoleId,
      isActive: true,
      password: hashedCatalogPassword,
      name: catalogName,
    },
    create: {
      name: catalogName,
      email: catalogEmail,
      password: hashedCatalogPassword,
      roleId: catalogRoleId,
      isActive: true,
    },
  });

  // Upsert Deactivated User (for testing 401 responses)
  await prisma.user.upsert({
    where: { email: deactivatedEmail },
    update: {
      roleId: catalogRoleId,
      isActive: false,
      password: hashedDeactivatedPassword,
      name: "Deactivated User",
    },
    create: {
      name: "Deactivated User",
      email: deactivatedEmail,
      password: hashedDeactivatedPassword,
      roleId: catalogRoleId,
      isActive: false,
    },
  });

  console.log("✅ Seeded users:");
  console.log(`  👑 Super Admin: ${superAdminEmail} / ${superAdminPassword}`);
  console.log(`  📦 Catalog-only: ${catalogEmail} / ${catalogPassword}`);
  console.log(`  🚫 Deactivated: ${deactivatedEmail} / ${deactivatedPassword} (inactive)`);
}

async function verifySeed() {
  console.log("\n🔍 Verifying seed...");

  const totalPermissions = await prisma.permission.count();
  const totalGroups = await prisma.permissionGroup.count();
  const totalRoles = await prisma.role.count();
  const totalUsers = await prisma.user.count();
  const totalRolePermissions = await prisma.rolePermission.count();

  console.log(`  📊 Database stats:`);
  console.log(`    - ${totalPermissions} permissions in ${totalGroups} groups`);
  console.log(`    - ${totalRoles} roles`);
  console.log(`    - ${totalUsers} users`);
  console.log(`    - ${totalRolePermissions} role-permission assignments`);

  // Verify Super Admin has all permissions
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "Super Admin" },
    include: {
      permissions: true,
    },
  });

  if (superAdminRole) {
    const permCount = superAdminRole.permissions.length;
    const totalPerms = await prisma.permission.count();

    if (permCount === totalPerms) {
      console.log(`  ✅ Super Admin has all ${permCount} permissions`);
    } else {
      console.warn(`  ⚠️ Super Admin has ${permCount}/${totalPerms} permissions`);
    }
  }

  // Verify Catalog Manager has limited permissions
  const catalogRole = await prisma.role.findUnique({
    where: { name: "Catalog Manager" },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (catalogRole) {
    const permNames = catalogRole.permissions.map((rp) => rp.permission.name);
    const hasSystemAccess = permNames.some(
      (name) =>
        name.startsWith("permission:") ||
        name.startsWith("role:") ||
        name.startsWith("user:") ||
        name.startsWith("dashboard:") ||
        name.startsWith("media:")
    );

    if (!hasSystemAccess) {
      console.log(`  ✅ Catalog Manager has no system permissions`);
    } else {
      console.warn(
        `  ⚠️ Catalog Manager has system permissions: ${permNames
          .filter(
            (n) =>
              n.startsWith("permission:") ||
              n.startsWith("role:") ||
              n.startsWith("user:") ||
              n.startsWith("dashboard:") ||
              n.startsWith("media:")
          )
          .join(", ")}`
      );
    }
  }

  // Verify catalog permissions are correct
  const catalogPermissions = await prisma.permission.findMany({
    where: {
      group: {
        name: {
          in: CATALOG_MODULES,
        },
      },
    },
  });

  const expectedCatalogCount = CATALOG_MODULES.reduce((acc, module) => {
    return acc + (PERMISSION_MAP[module]?.length || 0);
  }, 0);

  console.log(`  ✅ Catalog modules have ${catalogPermissions.length}/${expectedCatalogCount} expected permissions`);
}

async function main() {
  try {
    console.log("🌱 Seeding database...\n");

    // Step 1: Seed permissions
    await seedPermissions();

    // Step 2: Seed super admin role
    const superAdminRole = await seedSuperAdminRole();

    // Step 3: Seed catalog-only role
    const catalogRole = await seedCatalogOnlyRole();

    // Step 4: Seed users
    await seedUsers(superAdminRole.id, catalogRole.id);

    // Step 5: Verify everything
    await verifySeed();

    console.log("\n✅ Seed complete!");
    console.log("\n📝 Credentials can be customized via .env file:");
    console.log("   SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD");
    console.log("   CATALOG_USER_EMAIL, CATALOG_USER_PASSWORD");
    console.log("   DEACTIVATED_USER_EMAIL, DEACTIVATED_USER_PASSWORD");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();