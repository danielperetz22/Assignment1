import { BaseController } from "./baseController";
import Post, { IPost } from "../models/PostModel";
import Comment from "../models/CommentModel";
import { Request, Response } from "express";
import { log } from "console";

class PostController extends BaseController<IPost> {
  constructor() {
    super(Post);
  }

  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { title, content } = req.body;
      if (!title || !content) {
        res.status(400).json({ message: "Missing data" });
        return;
      }

      const postToUpdate = await Post.findByIdAndUpdate(
        req.params._id,
        { title, content },
        { new: true }
      );

      if (!postToUpdate) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      res.status(200).json(postToUpdate);
    } catch (error) {
      res.status(500).json({ message: "Error updating post", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;        
      const userEmail = req.user?.email;   
      const userUsername = req.user?.username;
      const userProfileImage = req.user?.profileImage;

      if (!userId) {
         res.status(401).json({ message: "Unauthorized" });
         return;
      }
  
      const image = req.file?.path;
      if (!req.body.title || !req.body.content) {
       res.status(400).json({ message: "Missing required fields" });
       return;
      }
      req.body.email = userEmail; 
      req.body.username = userUsername;
      req.body.userProfileImage = userProfileImage;
      req.body.owner = userId;
      req.body.image = image;
      req.body.comments = [];
      console.log(req.body);
  
      await super.create(req, res);
    } catch (error) {
      console.error("Error in create:", error);
      res.status(500).json({ message: "Error creating post", error });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const posts = await Post.find();

      const postsWithComments = await Promise.all(
        posts.map(async (post) => {
          const comments = await Comment.find({ postId: post._id });
          return { ...post.toObject(), comments };
        })
      );

      res.status(200).json(postsWithComments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts", error });
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    try{
      const post = await Post.findById(req.params.id);

      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "You are not authorized to delete this post" });
      return;
    }

    await post.deleteOne(); 
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
}
}

export default new PostController();