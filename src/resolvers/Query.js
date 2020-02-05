const { forwardTo } = require("prisma-binding");

const Query = {
  users: forwardTo("db"),
  currentUser(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  async randomPhotos(parent, args, ctx, info) {
    const {
      aggregate: { count }
    } = await ctx.db.query.imagesConnection({}, "{aggregate {count}}");
    const amount = 5;
    if (count <= amount) return ctx.db.query.images({}, info);
    const random = Math.floor(Math.random() * (count - amount));
    return ctx.db.query.images({ skip: random, first: amount }, info);
  }
};

module.exports = Query;
