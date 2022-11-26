import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { response } from "express"
import { apiSlice } from "../../app/api/apiSlice"

const userAdapter = createEntityAdapter({})

//Returns a new entity state object like {ids: [], entities: {}}
const initialState = userAdapter.getInitialState()

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query({
      query: () => '/users',
      validateStatus: (response, result) => {
        // need to added in !result.isError, by default always 200
        return response.status === 200 && !result.isError
      },
      //default 60s
      keepUnusedDataFor: 5,
      transformResponse: responseData => {
        const loadedUsers = responseData.map(user => {
          user.id = user._id
          return user
        })
        return userAdapter.setAll(initialState, loadedUsers)
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: 'User', id: 'LIST' },
            ...result.ids.map(id => ({ type: 'User', id }))
          ]
        } else return [{ type: 'User', id: 'LIST' }]
      }
    })
  })
})

export const { useGetUsersQuery } = usersApiSlice

// selector function without arg api.endpoints.getPosts.select({ page: 5 })
// then called as selector(state) or passed into useSelector(selector)
// altogether end up with api.endpoints.getPosts.select()(state)
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

const selectUsersData = createSelector(
  selectUsersResult,
  state => state.data
)

export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds
} = userAdapter.getSelectors(state => selectUsersData(state) ?? initialState)

// exsample
// const store = configureStore({
//   reducer: {
//     books: booksReducer,
//   },
// })

// const simpleSelectors = booksAdapter.getSelectors()
// const globalizedSelectors = booksAdapter.getSelectors((state) => state.books)

// // Need to manually pass the correct entity state object in to this selector
// const bookIds = simpleSelectors.selectIds(store.getState().books)

// // This selector already knows how to find the books entity state
// const allBooks = globalizedSelectors.selectAll(store.getState())