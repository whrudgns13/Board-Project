import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity({name :"users"})
export class Users {
  @PrimaryColumn({length : 45})
  public id?: string;

  @Column({length : 100, unique : true})
  public email: string;

  @Column({length : 50})
  public name: string;

  @Column({length : 45})
  public password: string;
}
