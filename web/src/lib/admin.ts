import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;

  const adminEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (user.role === UserRole.ADMIN || adminEmails.includes(user.email.toLowerCase())) {
    if (user.role !== UserRole.ADMIN && adminEmails.includes(user.email.toLowerCase())) {
      await prisma.user.update({ where: { id: user.id }, data: { role: UserRole.ADMIN } });
    }
    return user;
  }
  return null;
}
