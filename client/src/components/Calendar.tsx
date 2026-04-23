import React, { useMemo, useState, useEffect } from "react";
import TaskForm from "./TaskForm";
import type { Task } from "../types/types";
import { getCategories } from "../api/categoryApi";
import type { Category } from "../types/types";
import "../styles/Calendar.css";
import { getTasks, updateTask, createTask } from "../api/taskApi"; 

// Format a date as YYYY-MM-DD
const formatDateKey = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
};

// Convert task.dueDate to a date key-shows only tasks of current year
const parseDueDateToKey = (dueDate: string, targetYear: number): string | null => {
  if (!dueDate) return null;

  const [year, month, day] = dueDate.split("-").map(Number);

  if (year === targetYear) {
    return formatDateKey(year, month - 1, day); // -1 formatDateKey expects 0-based month
  }

  return null;
};

// Group tasks by date
const groupTasksByDate = (tasks: Task[], year: number): Map<string, Task[]> => {
  const map = new Map<string, Task[]>();

  for (const task of tasks) {
    // handles both dueDate and due_date
    // extract tasks duedate as key - 'any' - bypass ts type checking since backend might return either dueDate or due_date 
    const key = parseDueDateToKey(
      (task as any).dueDate || (task as any).due_date,
      year
    );
    // if date exists, then get tasks for that date, add current task, and update map
    if (key) {
      const arr = map.get(key) || [];
      arr.push(task);
      map.set(key, arr); // key is date string, value is array of tasks for that date
    }
  }
  // returns grouped tasks by date
  return map;
};

// Generate weeks for a given month
const getMonthWeeks = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay(); // get which day the month starts on (0-6)
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // total days in the month

  const weeks: any[] = []; // all weeks in the month
  let week: any[] = []; // current week being built

  for (let i = 0; i < firstDay; i++) week.push({ day: 0 }); // fill empty cells before the first day of the month 
  // like if month starts on Wednesday (3), [0,0,0,1,2,3,...]

  // loop through all days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    week.push({ day: d });
    if (week.length === 7) {
      // if we have a full week, push it to weeks array and start a new week
      weeks.push(week);
      week = [];
    }
  }
  // leftover days - fills the remaining cells with 0
  if (week.length) {
    while (week.length < 7) week.push({ day: 0 });
    weeks.push(week);
  }

  return weeks;
};

// Month Card Component
const MonthCard = ({ year, month, tasksByDate, onDateClick }: any) => {
  // get month name 
  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
  });
  const weeks = getMonthWeeks(year, month);

  return (
    <div className="month-card">
      {/* display month name */}
      <div className="month-header">{monthName}</div>
      {/* display weekdays */}
      <div className="weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      {/* loops through weeks */}
      {weeks.map((week: any, i: number) => (
        <div className="week-row" key={i}>
          {week.map((dayObj: any, j: number) => {
            const key = formatDateKey(year, month, dayObj.day);
            const dayTasks = tasksByDate.get(key) || [];

            return (
              <div
                key={j}
                className={`day-cell ${dayObj.day === 0 ? "empty" : ""}`}
                onClick={() =>
                  // clickable if day not 0
                  dayObj.day !== 0 && onDateClick(key, dayTasks)
                }
              >
                <div className="day-number">
                  {/* display day number */}
                  {dayObj.day !== 0 ? dayObj.day : ""}
                </div>

                {dayTasks.slice(0, 2).map((task: Task) => (
                  // show up to 2 tasks of the day
                  <div key={task.id} className="task-dot">
                    {/* show task title */}
                    {task.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Calendar Page Component
const Calendar: React.FC = () => {
  const currentYear = new Date().getFullYear(); // like 2024
  const [tasks, setTasks] = useState<Task[]>([]); // state for tasks
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // stores selected date in YYYY-MM-DD format
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]); // store tasks of the selected date
  const [categories, setCategories] = useState<Category[]>([]); //store categories 

  // Fetch tasks - runs once on component mount - fetches all tasks and categories in parallel and stores them in state
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [taskData, categoryData] = await Promise.all([
        getTasks(),
        getCategories(),
      ]);
      // then update state with fetched tasks and categories
      setTasks(taskData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  // call the async function to fetch data - runs once []empty dependency array
  fetchData();
}, []);

  // Group tasks - only when tasks change - memoize eles it runs on ever render
  const tasksByDate = useMemo(
    () => groupTasksByDate(tasks, currentYear),
    [tasks, currentYear]
  );
  // handles when date is clicked - sets selected date and tasks for that date in state
  const handleDateClick = (dateKey: string, tasks: Task[]) => {
    setSelectedDate(dateKey);
    setSelectedTasks(tasks);
  };
  // handles to mark task as completed or undo
  const toggleTaskStatus = async (task: Task) => {
    const newStatus =
      task.status === "Completed" ? "In Progress" : "Completed";

    try {
      await updateTask(task.id, { status: newStatus });
      // refetch tasks after update to get the latest data and update state - ensures calendar reflects changes immediately
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);

      if (selectedDate) {
        // filters tasks for that date after updating status
        const tasksForDate = updatedTasks.filter(
          (t) =>
            parseDueDateToKey(
              (t as any).dueDate || (t as any).due_date,
              currentYear
            ) === selectedDate
        );
        // update selected tasks to reflect the status change
        setSelectedTasks(tasksForDate);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i); // array of month indices [0,1,...11]

  return (
    <div className="calendar-page">
      <h1>Task Calendar</h1>

      <div className="calendar-grid">
        {/* loop through all months */}
        {months.map((month) => (
          // pass month, year, tasks grouped by date, and date click handler to MonthCard component
          <MonthCard
            key={month}
            year={currentYear}
            month={month}
            tasksByDate={tasksByDate}
            onDateClick={handleDateClick}
          />
        ))}
      </div>

      {/* Modal */}
      {/* if a date is selected */}
      {selectedDate && (
        <div className="calendar-modal">
          <div className="calendar-modal-content">
            <h3>Tasks on {selectedDate}</h3>

            {selectedTasks.length === 0 ? (
              <p>No tasks for this date</p>
            ) : (
              selectedTasks.map((task) => (
                <div key={task.id} className="calendar-task-item">
                  <span>{task.title}</span>
                  <button onClick={() => toggleTaskStatus(task)}>
                    {task.status === "Completed"
                      ? "Undo"
                      : "Mark Completed"}
                  </button>
                </div>
              ))
            )}

            <h3>Create New Task</h3>

         
            <TaskForm
              initialData={{ due_date: selectedDate }}
              categories={categories} // FIX
              onSubmit={async (data) => {
                try {
                  // create a task
                  await createTask(data);

                  // refetch tasks to get the new task and update calendar
                  const updatedTasks = await getTasks();
                  setTasks(updatedTasks);

                  // close modal after creating task
                  setSelectedDate(null);
                } catch (err) {
                  console.error("Failed to create task:", err);
                }
              }}
            />

            {/* close button */}
            <button
              onClick={() => setSelectedDate(null)}
              className="close-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
