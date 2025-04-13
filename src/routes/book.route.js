import { Router } from "express";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middlewares/auth.middleware.js";
import Book from "../models/book.model.js";

const router = Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, rating, caption, image } = req.body;
    if (!title || !rating || !caption || !image) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    //upload image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "books",
    });
    const imageUrl = uploadResponse.secure_url;

    //save book to database
    const book = await Book.create({
      title,
      rating,
      caption,
      image: imageUrl,
      user: req.user.id,
    });

    return res.status(201).json(book);
  } catch (error) {
    console.log("error in creating book", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");
    const totalBooks = await Book.countDocuments();
    return res.status(200).json({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("error in getting books", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }
    if (book.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    //delete image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("error in deleting image from cloudinary", error);
      }
    }

    await book.deleteOne();
    return res.status(200).json({ msg: "Book deleted successfully" });
  } catch (error) {
    console.log("error in deleting book", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;
