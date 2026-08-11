import { prisma } from "../../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function getUserStore(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      store: true,
      managedStore: true,
      role: true,
      staffStore: { include: { store: true } },
    },
  });
  if (!user) return null;
  if (user.managedStore) return user.managedStore;
  if (user.store) return user.store;
  if (user.staffStore && user.staffStore.length > 0) {
    return user.staffStore[0].store;
  }
  return null;
}

export async function getFirstStore() {
  return await prisma.store.findFirst({
    where: {
      name: { not: "" }
    }
  });
}

export async function resolveStoreId(user, queryStoreId) {
  if (queryStoreId) return queryStoreId;
  const store = await getUserStore(user.id);
  if (store) return store.id;
  
  const firstStore = await getFirstStore();
  if (firstStore) return firstStore.id;

  throw new AppError("No active store associated with this account.", 400);
}
