import { Column, CreateDateColumn, Entity,  PrimaryGeneratedColumn } from 'typeorm';

@Entity({name :"comments"})
export class Comments {
  @PrimaryGeneratedColumn('increment')
  public comment_id: string;

  @Column({nullable : false})
  public post_id: number;

  @Column({nullable : false})
  public content: string;
  
  @Column({nullable : false})
  public email: string;

  @CreateDateColumn()
  public created_at: Date;
}
