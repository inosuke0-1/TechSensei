const express = require("express");
const router = express.Router();

const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const {
      sub,
      email,
      name,
      picture
    } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        username: name,
        avatar: picture
      });
    }

    const appToken = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: appToken,
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false
    });
  }
});

module.exports = router;