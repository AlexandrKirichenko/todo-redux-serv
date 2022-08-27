import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async function (_,{rejectWithValue}){
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
      // console.log('response',response)
      if (!response.ok) {
        throw new Error('ServerError');
      }
      
        const data = await response.json();
        return data;
    
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async function (id,{rejectWithValue, dispatch}){
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/${id}',
        {method: 'DELETE'
        });
     
      if (!response.ok) {
        throw new Error('Cant del task, Server error');
      }
      // console.log('respDel', response)
      dispatch(removeTodo({id}));
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleTodo = createAsyncThunk(
  'todos/toggleTodo',
  async function (id,{rejectWithValue, dispatch, getState}){
    const todo = getState().todos.todos.find(todo => todo.id === id)
    
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/${id}', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !todo.completed
        })
        });
      
      if (!response.ok) {
        throw new Error('Cant toggle todo, Server error');
      }
      // проверяю работает ли, в коде это не нужно
      // const data = await response.json();
      // console.log('data', data)
      dispatch(toggleComplete({id}))
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addNewTodo = createAsyncThunk(
  'todos/addNewTodo',
  // смотрим в App что передаем  dispatch(addTodo({text}));, на основании этого пишем параметр
  async function (text,{rejectWithValue, dispatch}){
    
    try {
      // формируем объект который будем отправлять, он должен соответсвовать тому, что ожидает сервер
      // id генерируется сервером автоматически,userId мы его не выбираем, а просто захаркодим, комплитед, всегда фолс, т.к задача новая
      // а текст корый набил пользователь, это наш тайтл
      // {
      // "userId": 1,
      // "id": 1,
      // "title": "delectus aut autem",
      // "completed": false
      // },
      const todo = {
        title: text,
        userId: 1,
        completed: false,
      }
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo)
      });
      
      if (!response.ok) {
        throw new Error('Cant toggle todo, Server error');
      }
      // в данном случае нам нужно получить ответ с данными, т.к. нам нужен ИД кот сгенериров сервер
      const data = await response.json();
      console.log(data)
      dispatch(addTodo(data));
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



const setError = (state, action) => {
  state.status = 'rejected';
  state.error = action.payload;
}

const todoSlice = createSlice({
    name: 'todos',
    initialState: {
        todos: [],
        status: null,
        error: null
    },
    reducers: {
        addTodo(state, action) {
            // console.log('state', state);
            // console.log('action', action);
            state.todos.push(action.payload);
        },
        toggleComplete(state, action) {
            const toggledTodo = state.todos.find(todo => todo.id === action.payload.id);
            toggledTodo.completed = !toggledTodo.completed;
        },
        removeTodo(state, action) {
            state.todos = state.todos.filter(todo => todo.id !== action.payload.id);
        }
    },
    extraReducers:{
      [fetchTodos.pending]: (state, action) => {
        state.status = 'loading';
        state.error = null;
      },
      [fetchTodos.fulfilled]: (state, action) => {
        state.status = 'resolved';
        state.todos = action.payload;
      },
      [fetchTodos.rejected]: setError,
      [deleteTodo.rejected]: setError,
      [toggleTodo.rejected]: setError,
    },
});

const {addTodo, toggleComplete, removeTodo} = todoSlice.actions;

export const todoSliceReducers = todoSlice.actions;

export default todoSlice.reducer;
