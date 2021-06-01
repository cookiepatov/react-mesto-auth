import { React, useEffect, useState, useCallback } from 'react';

import { api } from '../utils/api';
import { auth } from '../utils/auth'
import { CurrentUserContext } from '../contexts/CurrentUserContext';

import Header from './Header';
import Main from './Main'
import Footer from './Footer';
import EditProfilePopup from './EditProfilePopup';
import ImagePopup from './ImagePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import DeleteCardPopup from './DeleteCardPopup';
import InfoTooltip from './InfoTooltip';
import AuthForm from './AuthForm';
import {Switch, useHistory, useLocation, Route, withRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const history = useHistory();
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isDeleteCardPopupOpen, setDeleteCardPopupOpen] = useState(false);
  const [isImagePopupOpen, setImagePopupOpen] = useState(false);
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [cardToDelete, setCardToDelete] = useState({});
  const [popupDataIsLoading, setPopupDataIsLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tooltipAcceptedStatus, setTooltipAcceptedStatus] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([user, cards]) => {
        checkToken();
        setCurrentUser(user);
        setCards(cards);
      }).catch(err => {
        openToolTip(false);
        console.log(err);
      });
  }, [])



  function handleEditAvatarClick() {
    setEventListeners();
    setEditAvatarPopupOpen(true);

  }

  function handleEditProfileClick() {
    setEventListeners();
    setEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setEventListeners();
    setAddPlacePopupOpen(true)
  }

  function handleDeleteCardClick(card) {
    setEventListeners();
    setDeleteCardPopupOpen(true);
    setCardToDelete(card);
  }

  function handleCardClick(card) {
    setEventListeners();
    setImagePopupOpen(true);
    setSelectedCard(card);
  }

  function openToolTip(state) {
    setTooltipOpen(true);
    setTooltipAcceptedStatus(state);
    setEventListeners();
  }

  function closeAllPopups() {
    removeEventListeners();
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setDeleteCardPopupOpen(false)
    setImagePopupOpen(false);
    setTooltipOpen(false);
    setSelectedCard({});
    setCardToDelete({});
  }

  function handleUpdateUser({ name, about }) {
    setPopupDataIsLoading(true);
    api.setUserInfo(name, about)
      .then(user => {
        setCurrentUser(user);
        closeAllPopups();
      })
      .catch(err => {
        openToolTip(false);
        console.log(err);
      })
      .finally(() => {
        setPopupDataIsLoading(false)
      });
  }

  function handleUpdateAvatar(link) {
    setPopupDataIsLoading(true);
    api.setUserAvatar(link)
      .then(user => {
        setCurrentUser(user);
        closeAllPopups();
      })
      .catch(err => {
        openToolTip(false);
        console.log(err);
      })
      .finally(() => {
        setPopupDataIsLoading(false)
      });
  }



  function handleCardLike(card) {
    const isLiked = card.likes.some(like => like._id === currentUser._id);
    api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
      setCards(cards => cards
        .map(currentCard => currentCard._id === card._id ? newCard : currentCard));
      closeAllPopups();
    }).catch(err => {
      openToolTip(false);
      console.log(err);
    });
  }

  function handleConfirmDelete(card) {
    setPopupDataIsLoading(true);
    api.deleteCard(card._id)
      .then(() => {
        setCards(cards => cards
          .filter(currentCard => currentCard._id !== card._id));
        closeAllPopups();
      })
      .catch(err => {
        openToolTip(false);
        console.log(err);
      })
      .finally(() => {
        setPopupDataIsLoading(false)
      });
  }



  function handleAddCard({ name, link }) {
    setPopupDataIsLoading(true);
    api.addNewCard(name, link)
      .then(newCard => {
        setCards(cards => [newCard, ...cards]);
        closeAllPopups();
      })
      .catch(err => {
        openToolTip(false);
        console.log(err);
      })
      .finally(() => {
        setPopupDataIsLoading(false);
      });
  }

  function handleSignIn({ email, password }) {
    auth.authorize({ email, password }).then(res => {
      setLoggedIn(true);
      setUserEmail(email);
      saveToken(res.token);
      history.push('/');
    }).catch(err => {
      openToolTip(false);
      console.log(err);
    })
  }

  function handleSignUp({ email, password }) {
    auth.register({ email, password }).then(res => {
      openToolTip(true);
      history.push('/sign-in');
    }).catch(err => {
      openToolTip(false);
      console.log(err);
    })
  }

  function handleSignOut() {
    removeToken();
  }

  function saveToken(jwt) {
    localStorage.setItem('jwt',jwt);
  }


  function checkToken() {
    const jwt = localStorage.getItem('jwt')
    if(jwt) {
      auth.checkToken({jwt}).then((res) => {
        setUserEmail(res.data.email);
        setLoggedIn(true);
        history.push('/')
      }).catch(err => {
        openToolTip(false);
        console.log(err);
      })
    }
  }

  function removeToken() {
    localStorage.removeItem('jwt');
  }

  function setEventListeners() {
    document.addEventListener('keydown', closeOnEsc);
    document.addEventListener('pointerdown', closeOnOverlay);
  }

  function removeEventListeners() {
    document.removeEventListener('keydown', closeOnEsc);
    document.removeEventListener('pointerdown', closeOnOverlay);
  }


  const closeOnEsc = useCallback((e) => {
    if (e.key === 'Escape') {
      closeAllPopups();
    }
  }, []);

  const closeOnOverlay = useCallback((e) => {
    if (e.target.classList.contains('popup')) {
      closeAllPopups();
    }
  }, [])

  return (

      <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
          <Header
            currentLocation={useLocation().pathname}
            login={userEmail}
            signOut={handleSignOut} />
          <Switch>
            <Route
              exact
              path="/sign-in">
              <AuthForm
                loggedIn={loggedIn}
                onSubmit={handleSignIn}
                isRegisterForm={false} />
            </Route>
            <Route
              exact
              path="/sign-up">
              <AuthForm
                loggedIn={loggedIn}
                onSubmit={handleSignUp}
                isRegisterForm={true} />
            </Route>
          <ProtectedRoute
              exact
              path="/"
              loggedIn={loggedIn}
              component={Main}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardClick={handleCardClick}
              cards={cards}
              onCardLike={handleCardLike}
              onCardDelete={handleDeleteCardClick} />
          </Switch>
          <Footer />
          <InfoTooltip
            onClose={closeAllPopups}
            isOpen={isTooltipOpen}
            accepted={tooltipAcceptedStatus} />
          <EditProfilePopup
            onUpdateUser={handleUpdateUser}
            onClose={closeAllPopups}
            isOpen={isEditProfilePopupOpen}
            isLoading={popupDataIsLoading} />
          <AddPlacePopup
            onAddPlace={handleAddCard}
            onClose={closeAllPopups}
            isOpen={isAddPlacePopupOpen}
            isLoading={popupDataIsLoading} />
          <EditAvatarPopup
            onUpdateAvatar={handleUpdateAvatar}
            onClose={closeAllPopups}
            isOpen={isEditAvatarPopupOpen}
            isLoading={popupDataIsLoading} />
          <DeleteCardPopup
            onDeleteCard={handleConfirmDelete}
            onClose={closeAllPopups}
            isOpen={isDeleteCardPopupOpen}
            selectedCard={cardToDelete}
            isLoading={popupDataIsLoading} />
          <ImagePopup
            isOpen={isImagePopupOpen}
            onClose={closeAllPopups}
            selectedCard={selectedCard} />
        </div>
      </CurrentUserContext.Provider>
  );
}

export default withRouter(App);
