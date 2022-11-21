module.exports = {
  database:
    "mongodb+srv://henry:jehovahnissi5@emaily-dev-cluster.hzwfi.mongodb.net/?retryWrites=true&w=majority",
  port: 3000,
  secretKey: "henry1234567890",
  facebook: {
    clientID: "1303750490361463",
    clientSecret: "005fca24f3dfc166399931e09277f17e",
    profileFields: ["emails", "displayName"],
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    passReqToCallback: true,
  },
};
