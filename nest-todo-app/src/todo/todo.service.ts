import { CreateTodoDto } from './dto/create-todo.dto';
import { Injectable } from '@nestjs/common';
// import { Sequelize } from 'sequelize';
import { Todo } from './todo.model';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class TodoService {
  constructor(
    @InjectModel(Todo)
    private readonly todoModel: typeof Todo,
  ) {}

  create(createUserDto: CreateTodoDto): Promise<Todo> {
    return this.todoModel.create({
      title: createUserDto.title,
      description: createUserDto.description,
    });
  }

  findAll() {
    return this.todoModel.findAll();
  }

  findOne(id: number) {
    return this.todoModel.findAll({
      where: {
        id,
      },
    });
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    return this.todoModel.update({ ...updateTodoDto }, { where: { id: id } });
  }

  remove(id: number) {
    return this.todoModel.destroy({
      where: {
        id,
      },
    });
  }
}
