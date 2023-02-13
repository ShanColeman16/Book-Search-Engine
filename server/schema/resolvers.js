const { User } = require("../models");
const resolvers = {
  Query: {
    me: async (_parent, args, context) => {
      const { user } = context;
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : args.id }, { username: args.username }],
      });
      return foundUser;
    },
  },
  Mutation: {
    async addUser(_parent, args) {
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
    async saveBook(_parent, { newBook }, context) {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: newBook } },
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