import { Request, Response } from 'express';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find({
        relations: ['following','followers','likedPosts']
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOne({
        where : {id: parseInt(req.params.id)},
        relations : ["followers","following"]
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email } = req.body;

      const newUser = this.userRepository.create({
        firstName,
        lastName,
        email,
      });

      const result = await this.userRepository.save(newUser);
      res.status(201).json(result);
      } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      this.userRepository.merge(user, req.body);
      const result = await this.userRepository.save(user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const result = await this.userRepository.delete(parseInt(req.params.id));
      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }

  async followUser(req: Request, res: Response) {
  try {
    const currUserId = parseInt(req.params.id);
    const userToFollowId = parseInt(req.body.userId);

    if (currUserId === userToFollowId) {
      return res.status(400).json({ message: "User cannot follow themselves" });
    }

    const currUser = await this.userRepository.findOne({
      where: { id: currUserId },
      relations: ['following'],
    });

    const userToFollow = await this.userRepository.findOne({
      where: { id: userToFollowId },
      relations: ['followers'],
    });

    if (!currUser || !userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    const alreadyFollowing = currUser.following.some(user => user.id === userToFollowId);

    if (!alreadyFollowing) {
      currUser.following.push(userToFollow);
      userToFollow.followers.push(currUser);
    }

    // Update counts
    currUser.totalFollowing = currUser.following.length;
    userToFollow.totalFollowers = userToFollow.followers.length;

    // Save both users
    await this.userRepository.save([currUser, userToFollow]);

    return res.json({ message: "User followed successfully", currUser });
  } catch (error) {
    console.error("Follow user error:", error);
    return res.status(500).json({ message: "Error following user", error });
  }
}

}
