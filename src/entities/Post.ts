import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import {Comment} from './Comment';
import {User} from './User'

@Entity('Post')
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, {onDelete : 'SET NULL'}) 
  @JoinColumn({ name: 'userId' }) 
  user: User;

  @Column({ type: 'varchar', length: 255 })
  message: string;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @ManyToMany(() => User, user => user.likedPosts, { cascade: true })
  @JoinTable({
    name: 'post_like_users_users',
    joinColumn: {
      name: 'postId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId', // matches your migration
      referencedColumnName: 'id',
    },
  })
  likeUsers: User[] ;

  @Column({ type: 'bigint', default: 0 })
  likes: number;

  @Column({type: "simple-array"})
  hashtags = [];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
