import {async} from 'regenerator-runtime'
import * as config from './config'
import { AJAX } from './helpers'
import recipeView from './views/recipeView'


export const state = {
    recipe:{},
    search : {
        query:'',
        results:[],
        resultsPerPage : config.RESULTS_PER_PAGE,
        page:1
    },
    bookmarks:[]
}

const creatRecipeObject = function(result){
    let {recipe} = result.data;
        return {
            id:recipe.id,
            title:recipe.title,
            publisher:recipe.publisher,
            sourceUrl : recipe.source_url,
            image: recipe.image_url,
            servings: recipe.servings,
            cookingTime:recipe.cooking_time,
            ingredients: recipe.ingredients,
            ...(recipe.key && {key: recipe.key})
        }
}

export const loadRecipe=async(id)=>{
    try {
        const result = await AJAX(`${config.API_URL}${id}`)
        state.recipe= creatRecipeObject(result)
        if(state.bookmarks.some((bookmark)=>bookmark.id===id)){
            state.recipe.bookmarked=true
        }else{
            state.recipe.bookmarked=false
        }
    } catch (error) {
        throw error;
        
    }  
}

/**
 * 
 * @param {*} query 
 */
export const loadSearchResults = async function(query){
    try {
        state.search.query= query;
        const result = await AJAX(`${config.API_URL}?search=${query}&key=${config.API_KEY}`)
        state.search.results = result.data.recipes.map((recipe)=>{
            return {
                id : recipe.id,
                title: recipe.title,
                publisher : recipe.publisher,
                image: recipe.image_url,
                ...(recipe.key && {key: recipe.key})
            }
        })
        state.search.page=1
        console.log('Search Results  : ',state.search);
    } catch (error) {
        throw error;
    }
}

export const getSearchResultsPage = function (page=state.search.page){
    state.search.page=page
    const start = (page-1)*state.search.resultsPerPage;
    const end = (page *state.search.resultsPerPage)
    return state.search.results.slice(start,end)
}

export const updateServings = function (newServings){
    console.log(state.recipe);
    state.recipe.ingredients.forEach((ingredient)=>{
        ingredient.quantity = ingredient.quantity*state.recipe.servings /newServings
    })
    console.log(state.recipe);
    state.recipe.servings = newServings;
}

const persistBookmarks = function(){
    localStorage.setItem('bookmarks',JSON.stringify(state.bookmarks))
  }

export const addBookmark = function (recipe){
    state.bookmarks.push(recipe);
    if(recipe.id ===state.recipe.id){
        state.recipe.bookmarked = true

    }
    persistBookmarks()
}

export const deleteBookmark = function (id){
    const index= state.bookmarks.findIndex(el=>el.id===id)
    state.bookmarks.splice(index,1)
    if(id ===state.recipe.id){
        state.recipe.bookmarked = false
    }
    persistBookmarks()
}

const init= function(){
    const storage = localStorage.getItem('bookmarks');
    if(storage) state.bookmarks=JSON.parse(storage)

}

init()

const clearBookmarks= function (){
    localStorage.removeItem('bookmarks')
}
// clearBookmarks()


export const uploadRecipe = async function(newRecipe){
    try {
        const ingredients = Object.entries(newRecipe).filter(entry=>{
           return entry[0].startsWith('ingredient') && entry[1]!==''
        }).map((ingredient)=>{
            // const ingredientArr = ingredient[1].replaceAll(' ','').split(',');
            const ingredientArr = ingredient[1].split(',').map(el=>el.trim());
            if(ingredientArr.length!==3){
                throw new Error(
                    'Wrong ingredient format .! please use the correct format'
                )
            }
            const [quantity,unit,description] =ingredientArr;
                return {
                    quantity:quantity?+quantity:null,
                    unit,description
                }
        })
        const recipe = {
            title:newRecipe.title,
            publisher:newRecipe.publisher,
            source_url : newRecipe.sourceUrl,
            image_url: newRecipe.image,
            servings: +newRecipe.servings,
            cooking_time:+newRecipe.cookingTime,
            ingredients
        }
        console.log(recipe);
        const data =  await AJAX(`${config.API_URL}?key=${config.API_KEY}`,recipe)
        state.recipe = creatRecipeObject(data)
        addBookmark(state.recipe)
    } catch (error) {
        throw error
    } 
}