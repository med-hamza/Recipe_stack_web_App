import { addToPlanner } from "../reducers/recipeplanner"
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecipedata } from '../reducers/recipeReducer';
import { addToWishlist } from '../reducers/wishReducer'
import { Link } from 'react-router-dom';
import Progressbar from './Progressbar';
import ReactPaginate from 'react-paginate';
import { HiSearch } from "react-icons/hi";
import { HiOutlineHeart } from "react-icons/hi"
import { HiHeart } from "react-icons/hi"
import Swal from 'sweetalert2';
import { setSelectedDays } from "../reducers/recipeplanner";



const Recipe = () => {
  const dispatch = useDispatch();
  const recipes = useSelector((state) => state.Recipe.recipes.recipes);
  const status = useSelector((state) => state.Recipe.status);
  const error = useSelector((state) => state.Recipe.error);
  const wishlistData = useSelector((state) => state.wishlists.wishlistItem);
  const maxLenth = 28;


  const [pageNumber, setPageNumber] = useState(0);
  const [showDaysMap, setShowDaysMap] = useState({});

  const recipesPerPage = 16;
  const pageVisited = pageNumber * recipesPerPage;

  const [searchVal, setSearchVal] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  const [Days, setDays] = useState([]);


  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchVal(value);

    const filtered = recipes.filter((recipe) =>
      recipe.Title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredRecipes(filtered);
    setPageNumber(0);
  };

  // add recipe in wishlist

  const addWishhandler = (recipes) => {
    const isRecipeInWishlist = wishlistData.some((item) => item._id === recipes._id);
    if (isRecipeInWishlist) {
      Swal.fire({
        icon: 'error',
        title: 'your Recipe has already been saved',
      })
    } else {
      dispatch(addToWishlist(recipes));
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Your Recipe saved',
        showConfirmButton: false,
        timer: 1500
      });
    }

  }


  const handleDaySelect = (recipeId, day, Title) => {
    const recipeIndex = Days.findIndex((item) => item.recipeId === recipeId);

    const newSelectedDays = [...Days];

    if (recipeIndex >= 0) {
      const recipeDays = newSelectedDays[recipeIndex].days;
      const dayIndex = recipeDays.indexOf(day);

      if (dayIndex >= 0) {
        recipeDays.splice(dayIndex, 1);
        if (recipeDays.length === 0) {
          newSelectedDays.splice(recipeIndex, 1);
        }
      } else {
        recipeDays.push(day);
      }
    } else {
      const recipe = recipes.find((recipe) => recipe._id === recipeId);
      const recipeTitle = recipe ? recipe.Title : '';
      newSelectedDays.push({ recipeId, days: [day], title: recipeTitle });
    }

    setDays(newSelectedDays);
    console.log("Selected Days:", newSelectedDays);
  };





  const isRecipeDaySelected = (recipeId, day) => {
    return Days.some((item) => item.recipeId === recipeId && item.days.includes(day));
  };



  const plannerdays = Days.map((pindex) => (
    <div key={pindex.recipeId}>
      {pindex.recipeId}
      {pindex.title}
      <div>
        {pindex.days}
      </div>
      <div> </div>

    </div>
  ));


  const renderDayCheckboxes = (recipeId) => {
    const showDays = showDaysMap[recipeId];
    if (!showDays) {
      return null;
    }
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const recipe = recipes.find((recipe) => recipe._id === recipeId);
    const recipeTitle = recipe ? recipe.Title : '';

    return days.map((day, index) => (
      <div key={index}>
        <input
          type="checkbox"
          checked={isRecipeDaySelected(recipeId, day)}
          onChange={() => handleDaySelect(recipeId, day, recipe.Title)} // Use recipe.Title instead of recipeTitle
        />
        <label>{day}</label>
      </div>
    ));
  };





  const recipesToDisplay = searchVal ? filteredRecipes : recipes || [];
  const displayRecipes = recipesToDisplay.length > 0 ? (
    recipesToDisplay
      .slice(pageVisited, pageVisited + recipesPerPage)
      .map((recipe) => (

        <div key={recipe._id}>
          <div className='border rounded-xl flex flex-col sm:w-[300px] w-[180px] p-3'>
            <div>
              <Link to={`/recipe/${recipe._id}`}>
                <img
                  src={`${window.location.origin}/images/${recipe.Image_Name}.jpg`}
                  alt={recipe.Title}
                  className="w-80 rounded-lg"
                />
                <div className='mb-2'>
                  <h2 className=' color-[#252525]  text-lg font-bold mt-5'>
                    {recipe.Title.length > maxLenth
                      ? `${recipe.Title.substring(0, maxLenth)}...`
                      : recipe.Title}

                  </h2>
                </div>
              </Link>
              <button aria-label="Add favorite" onClick={() => addWishhandler(recipe)}>
                {wishlistData.some((item) => item._id === recipe._id) ? (
                  <HiHeart className=' text-[#F6784C] text-2xl' />
                ) : (
                  <HiOutlineHeart className='text-[#F6784C] text-2xl' />
                )}
              </button>
              <button onClick={() => setShowDaysMap(prevState => ({ ...prevState, [recipe._id]: !prevState[recipe._id] }))}>
                Show
              </button>

              <div className="day-checkboxes">
                {showDaysMap[recipe._id] ?  (<>
                  {renderDayCheckboxes(recipe._id)}
                  <button
                className="add-to-planner-button"
                onClick={() =>
                  dispatch(
                    addToPlanner({
                      recipeId: recipe._id,
                      days: Days, // Use selectedDays instead of Days
                      Title: recipe.Title,
                    })
                  )
                }
              >
                Add to Planner
              </button>
                </>)  : null}
              </div>
              

            </div>
          </div>
        </div>

      ))
  ) : (
    <h3>No recipes found.</h3>
  );

  const handlePageClick = (data) => {
    const selectedPage = data.selected;
    setPageNumber(selectedPage);
  };

  useEffect(() => {
    dispatch(fetchRecipedata());
  }, [dispatch]);

  if (!recipes) {
    return <div>
      <Progressbar />
    </div>;
  }

  if (status === 'loading') {
    return <div> Loading... </div>
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='w-full max-w-7xl mx-auto'>
      <div className='flex w-1/2 mx-auto mb-10 text-center bg-[#fff] rounded-full border border-[#D9D9D9]'>
        <input
          type="text"
          value={searchVal}
          onChange={handleSearchChange}
          placeholder="Search for recipes..."
          className=' w-full  bg-transparent focus:outline-none focus-visible:none px-5 pt-3 pb-3'
        />
        <button aria-label="search recipe" className='bg-[#D9D9D9] rounded-3xl pl-2'>
          <HiSearch
            className=' font-extralight text-[#000] text-3xl mr-2'
          />
        </button>

      </div>
      <div className=' relative'>
        <div className=' absolute top-20 left-10'>
          <p className='text-[#DC582A] text-2xl mb-3'>Trending now </p>
          <h1 className=' text-5xl  text-white font-bold'>Mike’s famous salad <br />
            with cheese</h1>
        </div>
        <img src={process.env.PUBLIC_URL + '/recipe_cover.png'} alt="Background" className='mb-10' />
      </div>

      <div className='flex-wrap flex sm:justify-start justify-center sm:gap-4 gap-2'>
        {displayRecipes}
      </div>
      <ReactPaginate
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={Math.ceil(recipesToDisplay.length / recipesPerPage)}
        previousLabel="< previous"
        renderOnZeroPageCount={null}
        disabledClassName="hidden"
        activeClassName="paginationActive color-[#F6784C]"
        className='paginate text-base flex flex-nowrap mt-10 mb-10 justify-center'
      />
    </div>
  );
};

export default Recipe;
