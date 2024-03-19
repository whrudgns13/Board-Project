import { Column, CreateDateColumn, Entity,  PrimaryGeneratedColumn } from 'typeorm';

@Entity({name :"posts"})
export class Posts {
  @PrimaryGeneratedColumn('increment')
  public post_id: number;

  @Column()
  public title: string;
  
  @Column()
  public content: string;
  
  @Column({nullable: true})
  public id: string;
  
  @Column({nullable: true})
  public email: string;

  @CreateDateColumn()
  public created_at: Date;
}
