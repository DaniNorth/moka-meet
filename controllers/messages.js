const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const mongoose = require("mongoose");

// ChatGPT code
router.get("/", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const userId = new mongoose.Types.ObjectId(req.session.user._id);

    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            chatPair: {
              $cond: [
                { $gt: ["$sender", "$receiver"] },
                ["$receiver", "$sender"],
                ["$sender", "$receiver"]
              ]
            }
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          lastMessage: 1,
        },
      },
    ]);

    const chatPartnerIds = lastMessages.map(({ lastMessage }) =>
      lastMessage.sender.toString() === userId.toString()
        ? lastMessage.receiver
        : lastMessage.sender
    );

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } })
      .select("username profilePic")
      .lean();

    const formattedMessages = lastMessages.map(({ lastMessage }) => {
      const partnerId = lastMessage.sender.toString() === userId.toString()
        ? lastMessage.receiver
        : lastMessage.sender;

      const chatPartner = chatPartners.find(
        (partner) => partner._id.toString() === partnerId.toString()
      );

      return { chatPartner, lastMessage };
    });

    res.render("messages/index.ejs", { formattedMessages, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
});

router.get("/new", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const user = await User.findById(req.session.user._id)
      .populate("following", "username profilePic")
      .populate("followers", "username profilePic")
      .lean();

    const mutualFollowers = user.following.filter(followedUser =>
      user.followers.some(follower => follower._id.toString() === followedUser._id.toString())
    );

    res.render("messages/new.ejs", { mutualFollowers, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.redirect("/messages");
  }
});
// End of ChatGPT code

router.get("/:userId", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const userId = req.params.userId;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.redirect("/messages");
    }

    const chatPartner = await User.findById(userId).select("username profilePic").lean();
    if (!chatPartner) return res.redirect("/messages");

    const messages = await Message.find({
      $or: [
        { sender: req.session.user._id, receiver: userId },
        { sender: userId, receiver: req.session.user._id },
      ],
    })
      .populate("sender receiver", "username profilePic")
      .sort({ createdAt: 1 })
      .lean();

    res.render("messages/show.ejs", { messages, user: req.session.user, chatPartner });
  } catch (error) {
    console.error(error);
    res.redirect("/messages");
  }
});


router.post("/send", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/auth/sign-in");

    const sender = await User.findById(req.session.user._id);
    const receiver = await User.findById(req.body.receiver);

    if (!sender || !receiver) return res.redirect("/messages");

    const isMutualFollow =
      sender.following.includes(receiver._id) &&
      receiver.following.includes(sender._id);

    if (!isMutualFollow) return res.redirect("/messages");

    await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      messageText: req.body.messageText,
    });

    res.redirect(`/messages/${receiver._id}`);
  } catch (error) {
    console.error(error);
    res.redirect("/messages");
  }
});

module.exports = router;
