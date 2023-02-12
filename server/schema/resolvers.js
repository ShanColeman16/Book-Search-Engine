const { getSingleUser } = require('../controllers/user-controller');
const { User } = require('../models');

const resolvers = {
  Query:  {
   async getSingleUser(_parent, args, context) {
    const { user } = context;
    const foundUser = await User.findOne({
      $or: [
        { _id: user ? user._id : args.id }, 
        { username: args.username }
      ],
    });
    return foundUser;
   },
  },

  Mutation: {
    async createUser( _parent, args) {
      const user = await User.create(body);
      const token = signToken(user);

      return { user, token};
    },
    async login({ _parent }, email, password) {
      const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
      if (!user) {
        return res.status(400).json({ message: "Can't find this user" });
      }
  
      const correctPw = await user.isCorrectPassword(body.password);
  
      if (!correctPw) {
        return res.status(400).json({ message: 'Wrong password!' });
      }
      const token = signToken(user);
      res.json({ token, user });
    },
    async saveBook({ user, body }, res) {
      console.log(user);
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
        return res.json(updatedUser);
      } catch (err) {
        console.log(err);
        return res.status(400).json(err);
      }
    },



    

  }
};

module.exports = resolvers;