const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Mutations = {
  async createUser(parent, args, ctx, info) {

    args.email = args.email.toLowerCase();

    const password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password: password
        }
      },
      info
    );

    const token = jwt.sign({ userId: user.id }, "SuperSecretKey");

    ctx.response.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, //60min
      });

    return user;
  },
  async createImage(parent, args, ctx, info) {
    if(!ctx.request.userId) {
      throw new Error('Du skal være logged ind for at uploade et billed.');
    }

    const image = await ctx.db.mutation.createImage({
      data: {
        user : {
          connect : {
            id: ctx.request.userId
          }
        },
        ...args,
      }
    }, info);

    console.log(image);

    return image
  },
  async updateUser(parent, args, ctx, info) {
    const updates = { ...args };
    

    if(updates.password) {
      const password = await bcrypt.hash(args.password, 10);
      updates.password = password;
    }

    delete updates.id;

    return ctx.db.mutation.updateUser({
      data: updates,
      where: {
        id: args.id
      }
    }, info);

  },
  async signin(parent, { email, password }, ctx, info) {

    const user = await ctx.db.query.user({ where: { email }});
    
    if(!user) {
        throw new Error('No user with that email found.');
    }

    const valid = bcrypt.compare(password, user.password);

    if(!valid) {
        throw new Error('invalid password');
    }

    const token = jwt.sign({ userId: user.id }, "SuperSecretKey");

    ctx.response.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, //60min
      });

    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return 'logged out';
  },
};

module.exports = Mutations;
