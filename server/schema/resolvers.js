const { AuthenticationError } = require("apollo-server-express");

const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_parent, args, context) => {
      if(context.user) {
        return await User.findOne(context.user.id).populate('book');
      }
      throw new AuthenticationError("You need to be logged in!");
    },
   
  },
  Mutation: {
    async addUser(_parent, args) {
      console.log('ARGS', args);
      const user = await User.create(args);
      const token = signToken(user);
      return { user, token };
    },
    async login(_parent, { email, password }) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Can't find this user" });
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        return res.status(400).json({ message: "Wrong password!" });
      }
      const token = signToken(user);
      res.json({ token, user });
    },
    async saveBook(_parent, args, context) {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: args.input } },
          { new: true, runValidators: true }
        );
        return res.json(updatedUser);
      } catch (err) {
        console.log(err);
        return res.status(400).json(err);
      }
    },
    async removeBook(_parent, { bookId }, context) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return res
          .status(404)
          .json({ message: "Couldn't find user with this id!" });
      }
      return res.json(updatedUser);
    },
  },
};
module.exports = resolvers;