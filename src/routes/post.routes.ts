import { Router } from 'express';
import { PostController } from '../controllers/post.controller';

export const postRouter = Router();
const postController = new PostController();

//Create Post
postRouter.post('/user/:userId', postController.createPost.bind(postController));

//get Post
postRouter.get('/', postController.getAllPosts.bind(postController));

//get post by user
postRouter.get('/user/:id', postController.getPostById.bind(postController));

//like post by postId
postRouter.post("/user/:userId/like/:id", postController.likePostById.bind(postController));