import { Request, response, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Comment } from '../entities/Comment';
import { AppDataSource } from '../data-source';
import { In } from 'typeorm';
import { date } from 'joi';

export class PostController {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private commentRepository = AppDataSource.getRepository(Comment);

  async getAllPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [posts, totalPosts] = await this.postRepository.findAndCount({
        relations: ['user'],
        order:{
          createdAt: 'DESC'
        },
        skip,
        take: limit,
      });
      res.json({
        "data" : posts,
        "currentPage": page,
        "pageSize": limit,
        totalPosts,
        "totalPages": Math.ceil(totalPosts / limit)

      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error });
    }
  }

  async getPostByUserId(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const user = await this.userRepository.findOne({
        where : {id : parseInt(req.params.id)},
        relations : ["following"]
      })
      
      if (!user) {
       return res.status(404).json({ message: 'User not found' });
      }
      
      const followingUserIds = user.following.map(user => user.id);
      console.log(followingUserIds);
      const posts = await this.postRepository.find({
        where: {
          user: {
            id: In(followingUserIds),
          },
        },
        order:{
          createdAt: 'DESC'
        },
        relations: ['user', 'likeUsers', 'comments'],
      });      

      const allPosts = posts.length;
      const paginationPosts = posts.slice(skip, skip + limit);

      if (!posts) {
        return res.status(404).json({ message: 'post not found' });
      }
      res.json({
        "data":paginationPosts,
        "pageSize": limit,
        "currPage": page,
        totalPages: Math.ceil(allPosts/ limit)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error });
    }
  }

  async createPost(req: Request, res: Response) {
  try {
    const { message, hashtags} = req.body;

    const user = await this.userRepository.findOne({ where: { id: parseInt(req.params.userId) } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = this.postRepository.create({
      message,
      user,
      hashtags
    });

    console.log('Post before save:', post); // DEBUG: Should NOT contain id

    const result = await this.postRepository.save(post);

    console.log('Post after save:', result); // DEBUG: Should show auto-generated id

    res.status(201).json(result);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: 'Error creating post', error });
  }
}

  async updatePost(req: Request, res: Response) {
    try {
      const post = await this.postRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      this.postRepository.merge(post, req.body);
      const result = await this.postRepository.save(post);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating post', error });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const result = await this.postRepository.delete(parseInt(req.params.id));
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting Post', error });
    }
  }

  async likePostById(req: Request, res: Response){
    try{
        const user = await this.userRepository.findOneBy({id : parseInt(req.params.userId)})
        if(!user){
          return res.status(404).json({ message: 'User not found' });
        }

        const post = await this.postRepository.findOneBy({
            id : parseInt(req.params.id)
        });
        
        if(!post){
            return res.status(404).json({ message: 'Post not found' });
        }        

        if(!(post.likeUsers) ) post.likeUsers = [];
        
        const userId = parseInt(req.params.userId);                
        post.likeUsers = post.likeUsers.filter((user)=>user.id != userId);
        
        if(post.likeUsers.length == post.likes){
          post.likeUsers.push(user);
          post.likes = post.likeUsers.length;
        }else{
          post.likes = post.likeUsers.length;
        }

        const result = await this.postRepository.save(post);
        return res.json(result);
    }catch(error){
        res.status(500).json({ message: 'Error liking Post', error });
    }
  }

  async commentPost(req: Request, res: Response){
    try{
        const { message, userId, postId } = req.body;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) {
        return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = this.commentRepository.create({
        message,
        user,
        post,
        });

        const result = await this.commentRepository.save(newComment);
        return res.status(201).json(result);
    }catch(error){
        res.status(500).json({ message: 'Error commenting Post', error });
    }
  }


  async likeComment(req: Request, res: Response){
    try{
        let comment = await this.commentRepository.findOneBy({
            id : parseInt(req.params.id)
        });

        if(!comment){
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        comment.likes = comment.likes + 1;
        const result = await this.commentRepository.save(comment);
        return res.json(result);
    }catch(error){
        res.status(500).json({ message: 'Error liking Comment', error });
    }
  }

  async getPostsByHashtag(req: Request, res: Response) {
  try {
    const hashtag = "#" + req.params.tag;
    console.log(hashtag);
    const allPosts = await this.postRepository.find(); // inferred from Entity

    const requiredPosts = allPosts.filter(post =>
      Array.isArray(post.hashtags) &&
      post.hashtags.some(tag => (typeof tag === 'string') && tag.toLowerCase() === hashtag.toLowerCase())
    );

      res.json(requiredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  } catch (error) {
    console.error("Error in getPostsByHashtag:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}


}
