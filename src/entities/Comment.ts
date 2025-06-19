import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import {Post} from './Post'
import {User} from './User'

@Entity('Comment')
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, {onDelete : 'SET NULL'}) 
  @JoinColumn({ name: 'userId' }) 
  user: User;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'bigint', default: 0 })
  likes: number;

  @ManyToOne(() => Post, post => post.comments, { onDelete: 'CASCADE'})
  @JoinColumn({name: 'postId'})
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
