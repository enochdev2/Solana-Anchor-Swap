import AddTodo from "@/components/AddTodo";
import Todo from "@/components/Todo";
import TodosCount from "@/components/TodosCount";

export default function Home() {
  return (
    <div className="m-auto max-w-6xl ">
      <AddTodo />
    <div className="m-auto max-w-6xl rounded-xl py-2 px-12 mt-4 bg-gradient-to-bl from-[#05415f] to-[#070a07]">
      <Todo />
      <TodosCount />
      </div>
    </div>
  );
}
