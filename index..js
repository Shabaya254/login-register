import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import winston from "winston";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect('mongodb+srv://charlesshabaya:Shabs%402024@loginandregister.o6gvsu4.mongodb.net/Clients', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  winston.error('MongoDB connection error:', error);
});

db.once('open', () => {
  winston.info('Connected to MongoDB');
});


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

// Set salt rounds
const saltRounds = 12;

// Routes
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        console.log('Login Successful for user:', user.email);
        res.status(200).send({ message: "Login Successful", user });
      } else {
        console.log('Password mismatch for user:', user.email);
        res.status(401).send({ message: "Password didn't match" });
      }
    } else {
      console.log('User not found for email:', email);
      res.status(404).send({ message: "User not registered" });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('User already registered with email:', email);
      res.status(400).send({ message: "User already registered" });
    } else {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      console.log('User registered successfully with email:', email);
      res.status(201).send({ message: "Successfully Registered, Please login now." });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.listen( process.env.PORT || 9000) 
winston.info("BE started at port", process.env.PORT || 9000);