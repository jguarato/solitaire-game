function createCard(rank, suit, higher) {

    let suitSymbol, cardColor;
    switch (suit) {
        case 'spade':
            suitSymbol = '♠';
            cardColor = 'black';
            break;
        case 'heart':
            suitSymbol = '♥';
            cardColor = 'red';
            break;
        case 'diamond':
            suitSymbol = '♦';
            cardColor = 'red';
            break;
        case 'club':
            suitSymbol = '♣';
            cardColor = 'black';
            break;
        default:
            suitSymbol = '🃏';
            cardColor = 'black';
            break;
    }

    let frontInnerHTML = `<div class="inner-info card-rank">${rank}</div>`;
    frontInnerHTML += `<div class="inner-info card-suit-small">${suitSymbol}</div>`;
    frontInnerHTML += `<div class="inner-info card-suit-big">${suitSymbol}</div>`;

    return {
        rank,
        higher,
        inner: frontInnerHTML,
        suit,
        color: cardColor,
        below: null
    }
}

function createDeck() {

    const cardRanking = ['A', '2', '3', '4', '5',
        '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const cardSuits = ['spade', 'heart', 'diamond', 'club'];

    const deck = [];

    for (let i = 0; i < cardSuits.length; i++) {
        for (let j = 0; j < cardRanking.length; j++) {

            const higherRank = cardRanking[j + 1] ? cardRanking[j + 1] : null;
            const newCard = createCard(cardRanking[j], cardSuits[i], higherRank);
            deck.push(newCard);

        }

    }

    return deck;

}

function shuffleCards(deck) {
    return deck.sort(() => Math.random() - 0.5);
}

function putCardsInDeck(cards) {

    const deck = document.getElementById('deck');

    cards.forEach(() => {
        deck.innerHTML += `<div class="card back"></div>`;
    });

    const cardsInDeck = deck.querySelectorAll('.card');

    cards.forEach((card, index) => {
        cardsInDeck[index].cardInfo = card;
    });

}


function turnCard() {

    const isLastCard = this === this.parentNode.lastElementChild;
    const isCardVisible = this.style.visibility !== 'hidden';
    const isCardFacingDown = this.classList.contains('back');

    if (isLastCard && isCardVisible) {

        if (isCardFacingDown) {
        
            this.classList.remove('back');
            this.classList.add(`${this.cardInfo.suit}`);
            this.innerHTML = this.cardInfo.inner;
        }

        this.setAttribute('draggable', true);
    }

}

function turnCardBack(card) {
    
    card.classList.remove(`${card.cardInfo.suit}`);
    card.classList.add('back');
    card.innerHTML = '';
    card.setAttribute('draggable', false);

}

function distributeCards() {

    const piles = document.querySelectorAll('.row');

    piles.forEach((pile, index) => {
        
        for (let i = 0; i < index + 1; i++) {

            const deck = document.getElementById('deck');
            const topCard = deck.lastElementChild;

            if (i === index) {
                turnCard.apply(topCard);
            }

            deck.removeChild(topCard);
            pile.append(topCard);
        }

    });

}


function showTopCard(topCards, deck, deckTopCard) {

    if (deckTopCard.cardInfo) {

        deck.removeChild(deckTopCard);
        topCards.append(deckTopCard);
        
        if (topCards.childElementCount > 1) {
            topCards.childNodes[0].setAttribute('draggable', false);
        }

        if (topCards.childElementCount > 2) {
            topCards.childNodes[1].setAttribute('draggable', false);
        }

        if (topCards.childElementCount > 3) {

            topCards.childNodes[2].setAttribute('draggable', false);

            const firstCard = topCards.firstElementChild;

            turnCardBack(firstCard);
            firstCard.style.visibility = 'hidden';

            topCards.removeChild(firstCard);
            deck.prepend(firstCard);
        }

    }

}

function returnCardsToDeck(topCards, deck) {

    const cardsToDeck = [];

    topCards.childNodes.forEach(card => {
        turnCardBack(card);
        card.style.visibility = 'hidden';
        cardsToDeck.push(card);
    });

    cardsToDeck.forEach(card => {
        deck.prepend(card);
    });

    topCards.innerHTML = '';

    const cardsInDeck = deck.querySelectorAll('.card');

    cardsInDeck.forEach(card => {
        card.style.visibility = 'visible';
    });

    
}

function checkDeckCards() {

    const topCards = document.getElementById('top-cards');
    const deck = document.getElementById('deck');
    const deckTopCard = deck.lastElementChild;

    if (!deckTopCard) {
        returnCardsToDeck(topCards, deck);
    } else if (deckTopCard.style.visibility === 'hidden') {
        returnCardsToDeck(topCards, deck);
    } else {
        showTopCard(topCards, deck, deckTopCard);
    }

}


function changeCardPosition(cardToDrop, dropSpot, checkCondition) {

    if (checkCondition) {

        const cardAbove = cardToDrop.previousSibling;

        cardToDrop.parentNode.removeChild(cardToDrop);
        dropSpot.append(cardToDrop);

        if (cardToDrop.cardInfo.below) {
            cardToDrop.cardInfo.below.forEach(card => dropSpot.append(card));
        }

        return cardAbove;
    }

}

function dropInRow(cardToDrop, dropSpot) {
    
    const cardToDropInfo = cardToDrop.cardInfo;
    const lastCardInRow = dropSpot.lastElementChild;
    
    if (lastCardInRow) {

        const lastCardInfo = lastCardInRow.cardInfo;

        if (lastCardInfo && lastCardInRow.draggable) {

            const checkRank = lastCardInfo.rank === cardToDropInfo.higher;
            const checkColor = lastCardInfo.color !== cardToDropInfo.color;

            return changeCardPosition(cardToDrop, dropSpot, (checkRank && checkColor));
        }

    } else {

        const checkRank = cardToDrop.cardInfo.rank === 'K';

        return changeCardPosition(cardToDrop, dropSpot, checkRank);

    }
}

function dropInPile(cardToDrop, dropSpot) {

    const cardToDropInfo = cardToDrop.cardInfo;
    const lastCardInPile = dropSpot.lastElementChild;

    if (!cardToDropInfo.below) {

        if (lastCardInPile) {

            const lastCardInfo = lastCardInPile.cardInfo;

            if (lastCardInfo) {

                const checkRank = lastCardInfo.higher === cardToDropInfo.rank;
                const checkSuit = lastCardInfo.suit === cardToDropInfo.suit;

                if (checkRank && checkSuit) {
                    lastCardInPile.setAttribute('draggable', false);
                }

                return changeCardPosition(cardToDrop, dropSpot, (checkRank && checkSuit));

            } else {

                const checkRank = cardToDropInfo.rank === 'A';
                const checkSuit = lastCardInPile.id.split('-')[0] === cardToDropInfo.suit;

                return changeCardPosition(cardToDrop, dropSpot, (checkRank && checkSuit));
            }

        }
    }
}

function dropCard(event, cardToDrop) {

    const tgt = event.target;

    const findSpot = function (element, htmlClass) {

        const classList = element.classList;

        if (classList) {

            if (classList.contains(htmlClass)) {
                return element;

            } else {
                return findSpot(element.parentNode, htmlClass);

            } 

        }

        return;

    }

    const dropSpot = findSpot(tgt, 'row') || findSpot(tgt, 'pile');

    let cardAbove;

    if (dropSpot) {

        if (dropSpot.classList.contains('row')) {

            cardAbove = dropInRow(cardToDrop, dropSpot);

        } else if (dropSpot.classList.contains('pile')) {

            cardAbove = dropInPile(cardToDrop, dropSpot);

        }

    }

    if (cardAbove) {
        turnCard.apply(cardAbove);
    }

}

function checkGameOver() {

    const piles = document.querySelectorAll('.pile');

    let allPilesComplete =  true;

    piles.forEach(pile => {
        allPilesComplete = allPilesComplete && (pile.childElementCount - 1) === 13;
    });

    if (allPilesComplete) {
        alert('YOU WIN!');
    }
}

function resetSelections(card) {

    card.cardInfo.below = null;
    card = null;

    return card;
}

function dragRowCards(card) {

    const cardParent = card.parentNode;
    const isLastCard = card === cardParent.lastElementChild;

    if (!isLastCard) {

        card.cardInfo.below = [];

        for (let i = cardParent.childElementCount - 1; i >= 0; i--) {

            if (cardParent.childNodes[i] === card) {
                return;
            }

            card.cardInfo.below.unshift(cardParent.childNodes[i]);
        }
    }
}


const globalDeck = createDeck();
const shuffledDeck = shuffleCards(globalDeck);
putCardsInDeck(shuffledDeck);
distributeCards();

const deck = document.getElementById('deck');
deck.addEventListener('click', checkDeckCards);

const cards = document.getElementsByClassName('card');
for (let i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', turnCard);
}

let selectedCard = null;

document.addEventListener("dragstart", event => {
    if (event.target.draggable) {
        selectedCard = event.target;
        dragRowCards(selectedCard);
    }
});
  
document.addEventListener("dragover", event => {
    event.preventDefault();
}, false);

document.addEventListener("drop", event => {
    event.preventDefault();
    dropCard(event, selectedCard);
    selectedCard = resetSelections(selectedCard);
    checkGameOver();
});