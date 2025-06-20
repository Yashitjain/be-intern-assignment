import { Router } from 'express';
import { PostController } from '../controllers/post.controller';

export const postRouter = Router();
const postController = new PostController();

//Create Post
postRouter.post('/user/:userId', postController.createPost.bind(postController));

//get Post
postRouter.get('/', postController.getAllPosts.bind(postController));

//get post by user
postRouter.get('/user/:id', postController.getPostByUserId.bind(postController));

//like post by postId
postRouter.post("/user/:userId/like/:id", postController.likePostById.bind(postController));

//post by hashtags
postRouter.get("/hashtag/:tag", postController.getPostsByHashtag.bind(postController));

//delete post
postRouter.delete("/:id",postController.deletePost.bind(postController));