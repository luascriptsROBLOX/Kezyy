passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Save or retrieve user from the database
    User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) return done(err);
        if (!user) {
            const newUser = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            });
            newUser.save((err) => done(err, newUser));
        } else {
            done(null, user);
        }
    });
}));
