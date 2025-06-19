import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import {Post} from './Post';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ManyToMany(() => Post, post => post.likeUsers)
  likedPosts: Post[]; 

  @ManyToMany(() => User, user => user.followers)
  @JoinTable({
    name: 'user_following',
    joinColumn: {
      name: 'followerId',         // this user
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'followingId',        // user they are following
      referencedColumnName: 'id',
    },
  })
  following: User[];

  @Column({type : "bigint", default:0})
  totalFollowing : number;

  @ManyToMany(() => User, user => user.following,{ cascade: true })
  followers: User[] ;

  @Column({type : "bigint", default:0})
  totalFollowers : number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
