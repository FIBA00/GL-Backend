// graphql/loaders/user.loader.js
import DataLoader from "dataloader";
import User from "../../models/user.model.js";

export function createUserLoader() {
  return new DataLoader(async (userIds) => {
    const users = await User.find({ _id: { $in: userIds } });

    // DataLoader requires the returned array to be the SAME LENGTH
    // and SAME ORDER as the input keys — so we map back explicitly
    // rather than just returning `users` as-is.
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    return userIds.map((id) => userMap.get(id.toString()) || null);
  });
}