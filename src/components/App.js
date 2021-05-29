import {React, useEffect, useState, useCallback} from 'react';

import {api} from '../utils/api';
import {CurrentUserContext} from '../contexts/CurrentUserContext';

import Header from './Header';
import Main from './Main'
import Footer from './Footer';
import EditProfilePopup from './EditProfilePopup';
import ImagePopup from './ImagePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import DeleteCardPopup from './DeleteCardPopup';

function App() {
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = useState(false);
  const [isDeleteCardPopupOpen, setDeleteCardPopupOpen] = useState(false);
  const [isImagePopupOpen, setImagePopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [cardToDelete, setCardToDelete] = useState({});
  const [popupDataIsLoading, setPopupDataIsLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([user, cards]) => {
        setCurrentUser(user);
        setCards(cards);
      }).catch(console.log);
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

  function closeAllPopups() {
    removeEventListeners();
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setDeleteCardPopupOpen(false)
    setImagePopupOpen(false);
    setSelectedCard({});
    setCardToDelete({})
  }

  function handleUpdateUser({ name, about }) {
    setPopupDataIsLoading(true);
    api.setUserInfo(name, about)
      .then(user => {
        setCurrentUser(user);
        closeAllPopups();
      })
      .catch(console.log)
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
      .catch(console.log)
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
    }).catch(console.log);
  }

  function handleConfirmDelete(card) {
    setPopupDataIsLoading(true);
    api.deleteCard(card._id)
      .then(() => {
        setCards(cards => cards
          .filter(currentCard => currentCard._id !== card._id));
        closeAllPopups();
      })
      .catch(console.log)
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
      .catch(console.log)
      .finally(() => {
        setPopupDataIsLoading(false);
      });
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
        <Header />
        <Main
          onEditProfile={handleEditProfileClick}
          onAddPlace={handleAddPlaceClick}
          onEditAvatar={handleEditAvatarClick}
          onCardClick={handleCardClick}
          cards={cards}
          onCardLike={handleCardLike}
          onCardDelete={handleDeleteCardClick}
        />
        <Footer />
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

export default App;
