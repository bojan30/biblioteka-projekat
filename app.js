//elementi
const formInputs = document.querySelectorAll('#enter-book-form input');
const booksHolder = document.getElementById('books-holder');
const editFormWrapper = document.getElementById('edit-books');
const editForm = document.getElementById('edit-book-form');
const closeBtn = document.getElementById('close-btn');
const enterBooksWrapper = document.getElementById('enter-books-wrapper');
const enterBookForm = document.getElementById('enter-book-form');
const addBooksBtn = document.getElementById('add-books');

//prvo treba proveriti da li ima nesto u localStorage-u
let books = (!localStorage.length) ? [] : JSON.parse(localStorage.getItem('books'));

//regularni izrazi
let patterns = [
  /^([A-ZČĆŽŠĐ][a-zčćžšđ]{0,20}\.?\s?)+$/, //author
  /^[A-ZČĆŽŠĐ][\w\s\,\.]{1,}$/, //title
  /^[A-ZČĆŽŠĐ][\w\s\,\.]{0,}$/, //publisher
  /^\d{4}\.?$/,//year
];

//PRACENJE DOGADJAJA

window.addEventListener('load', render(books));
enterBookForm.addEventListener('submit', function (e) {
  //sprecava reload stranice
  e.preventDefault();
  //skupljamo inpute
  const id = new Date().getTime();
  const author = document.getElementById('author').value;
  const title = document.getElementById('title').value;
  const publisher = document.getElementById('publisher').value;
  const year = document.getElementById('year').value;
  if (isValidInput(author, patterns[0]) &&
    isValidInput(title, patterns[1]) &&
    isValidInput(publisher, patterns[2]) &&
    isValidInput(year, patterns[3])) {
    const book = new Book(id, author, title, publisher, year);
    books.push(book);
    addBook(book);
    //ovde treba dodati poruku
    displayMessage('Book is added successfuly!','success');
  }
  else {
    //ovde treba dodati poruku
    displayMessage('You have to enter all fields correctly!','danger');
  }
});

booksHolder.addEventListener('click', function (e) {
  if (e.target.classList.contains('delete')) {
    deleteBook(e.target, books);
  }
  else if (e.target.classList.contains('edit')) {
    displayEditForm(e.target);
  }
});

editForm.addEventListener('submit', function (e) {
  e.preventDefault();
  editBook(e.target);
  editFormWrapper.classList.remove('active');
})

closeBtn.addEventListener('click', function () {
  editFormWrapper.classList.remove('active');
})

//kontrolise vidljivost ikonice unutar input polja

formInputs.forEach(input => {
  input.addEventListener('focus', function () {
    this.style.paddingLeft = '10px';
    this.parentNode.classList.add('hide');
  })
});

formInputs.forEach(input => {
  input.addEventListener('blur', function () {
    this.style.paddingLeft = '30px';
    this.parentNode.classList.remove('hide');
  })
});

//dodaje informaciju o tome da li je input validan, menja boju bordera u zelenu ili crvenu

const inputs = document.querySelectorAll('#enter-book-form input');
inputs.forEach(input => {
  input.addEventListener('input', function (e) {
    if (e.target.value !== '') {
      if (isValidInput(e.target.value, patterns[e.target.dataset.id])) {
        this.classList.add('valid');
        this.classList.remove('invalid');
      }
      else {
        this.classList.add('invalid');
        this.classList.remove('valid');
      }
    }
    else {
      this.classList.remove('valid');
      this.classList.remove('invalid');
    }
  });
})

//KLASA KNJIGA

class Book {
  constructor(id, author, title, publisher, year) {
    this.id = id;
    this.author = author;
    this.title = title;
    this.publisher = publisher;
    this.year = year;
  }
}

//prikaz svih knjiga koje su tranutno u bazi

function render(books) {
  booksHolder.innerHTML = '';
  books.forEach(book => {
    addBook(book);
  })
}

//dodavanje nove knjige
function addBook(book) {
  //novi red u tabeli
  const newBookTr = document.createElement('TR');
  newBookTr.innerHTML = `
      <td>${book.author}</td>
      <td>${book.title}</td>
      <td>${book.publisher}</td>
      <td>${book.year}</td>
      <td>
        <button class = "edit">
          <i class = "fa fa-pencil-alt"></i>
          <div class="tooltip">
            <span>Edit</span>
          </div>
        </button>
        <button class="delete">
          <i class="fa fa-trash"></i>
          <div class="tooltip">
            <span>Delete</span>
          </div>
        </button>
      </td>
    `;
  //dodajemo data-id atribut zbog identifikovanja knjige
  //to ce biti korisno prilikom brisanja i editovanja
  newBookTr.setAttribute(`data-id`, `${book.id}`);
  booksHolder.appendChild(newBookTr);
  localStorage.setItem('books', JSON.stringify(books));
  //resetujemo inpute u formi posle unosa knjige
  resetInputs();
}

//prikaz forme za editovanje
function displayEditForm(target) {
  let tr = target.parentNode.parentNode;
  let id = Number(tr.getAttribute('data-id'));
  //prikazi formu za editovanje
  editFormWrapper.classList.add('active');
  //pronadji knjigu sa odgovarajucim id-jem
  editForm.setAttribute('data-id', id);
  books.forEach(book => {
    if (book.id === id) {
      //postavi inpute
      document.getElementById('author-edit').value = book.author;
      document.getElementById('title-edit').value = book.title;
      document.getElementById('publisher-edit').value = book.publisher;
      document.getElementById('year-edit').value = book.year;
    }
  })
}

//editovanje knjige zasnovano na jedinstvenom id-ju
function editBook(target) {
  const idToEdit = Number(target.getAttribute('data-id'));
  //novi inputi
  const newAuthor = document.getElementById('author-edit').value;
  const newTitle = document.getElementById('title-edit').value;
  const newPublisher = document.getElementById('publisher-edit').value;
  const newYear = document.getElementById('year-edit').value;

  books.map(book => {
    if (book.id === idToEdit) {
      book.author = newAuthor;
      book.title = newTitle;
      book.publisher = newPublisher;
      book.year = newYear;
    }
    return book;
  })
  render(books);
  localStorage.setItem('books', JSON.stringify(books));
  displayMessage('Book is edited successfuly!', 'success');
}

//brisanje knjige, zasnovano na jedinstvenom id-ju
function deleteBook(target) {
  let trToRemove = target.parentNode.parentNode;
  let id = Number(trToRemove.getAttribute('data-id'));
  books.forEach((book, index) => {
    if (book.id === id) {
      books.splice(index, 1);
    }
  })
  trToRemove.remove();
  localStorage.setItem('books', JSON.stringify(books));
  displayMessage('Book is deleted successfuly!', 'success');
}

//resetuje inpute

function resetInputs() {
  formInputs.forEach(input => {
    input.value = '';
    input.classList.remove('valid');
    input.classList.remove('invalid');
  })
}

//validator inputa

function isValidInput(input, pattern) {
  return pattern.test(input);
}

//prikazuje poruku (feedback) korisniku

function displayMessage(message, className) {
  //prvo treba napraviti div koji prikazuje poruke
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `<p>${message}</p>`;
  messageDiv.setAttribute('class', `message ${className}`);
  document.body.appendChild(messageDiv);

  //ukloni poruku nakon dve sekunde
  setTimeout(() => { messageDiv.remove() }, 2000);
}

//filter funkcija
const search = document.getElementById('search');
search.addEventListener('input',function(e){
  render(filteredBooks(e,books));
})
function filteredBooks(e,books){
  const term = e.target.value;
  return books.filter(book=>{
    return book.author.toLowerCase().match(term)
          || book.title.toLowerCase().match(term)
          || book.publisher.toLowerCase().match(term)
          || book.year.toLowerCase().match(term);
  });
};

addBooksBtn.addEventListener('click',toggleEnterBookForm);

function toggleEnterBookForm(){
  enterBookForm.classList.toggle('active');
}