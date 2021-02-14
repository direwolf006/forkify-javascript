import * as model from './model'
import recipeView from './views/recipeView'
import searchView from './views/searchView'
import resultsView from './views/resultsView'
import 'core-js/stable';
import 'regenerator-runtime'
import { async } from 'regenerator-runtime';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView'
import * as config from './config'


if(module.hot){
  module.hot.accept()
}
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes =async function(){
  try {
    const id = window.location.hash.slice(1);
    if(!id) return
    
    recipeView.renderSpinner()
    resultsView.update(model.getSearchResultsPage())
    bookmarksView.update(model.state.bookmarks)
    await model.loadRecipe(id)
    recipeView.render(model.state.recipe)
  } catch (error) {
    recipeView.renderError();
  }
}

const controlSearchResults = async function(){
  try {
    resultsView.renderSpinner()

    const query = searchView.getQuery();
    if(!query) return;

    await model.loadSearchResults(query)
    resultsView.render(model.getSearchResultsPage())

    paginationView.render(model.state.search)
    
  } catch (error) {
    console.log(error);
  }
}

const controlPagination=(gotoPage)=>{
  resultsView.render(model.getSearchResultsPage(gotoPage))

    paginationView.render(model.state.search)
}

const controlServings = function(newServings){
  model.updateServings(newServings)
  recipeView.update(model.state.recipe)
} 



const controlAddBookmark = function(){
  if(!model.state.recipe.bookmarked){
    model.addBookmark(model.state.recipe);
  }else{
    model.deleteBookmark(model.state.recipe.id);
  }

  recipeView.update(model.state.recipe)
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe =async function(newRecipe){
  try {

    addRecipeView.renderSpinner()
    await model.uploadRecipe(newRecipe)
    recipeView.render(model.state.recipe)
    addRecipeView.renderMessage()
    bookmarksView.render(model.state.bookmarks)
    window.history.pushState(null,'',`#${model.state.recipe.id}`)
    setTimeout(() => {
      addRecipeView.toggleWindow()
    }, config.MODAL_CLOSE_SECS*1000);
  } catch (error) {
    addRecipeView.renderError(error.message)
  }
}

const init=()=>{
  console.log('New Log , App is initialized');
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  addRecipeView._addHandlerUpload(controlAddRecipe)
}
init()

// window.addEventListener('hashchange',controlRecipes)
// window.addEventListener('load',controlRecipes)
