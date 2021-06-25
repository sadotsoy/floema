require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
var port = process.env.PORT;
var prismicApiEndpoint = process.env.PRISMIC_ENDPOINT;
var prismicAccessToken = process.env.PRISMIC_ACCESS_TOKEN;

const Prismic = require('@prismicio/client');
const PrismicDOM = require('prismic-dom');

const initPrismicApi = (req) => {
  return Prismic.getApi(prismicApiEndpoint, {
    accessToken: prismicAccessToken,
    req,
  });
};

const handlelinkResolver = (doc) => {
  // Define the url depending on the document type
  // if (doc.type === 'page') {
  //   return '/page/' + doc.uid;
  // } else if (doc.type === 'blog_post') {
  //   return '/blog/' + doc.uid;
  // }

  // Default to homepage
  return '/';
};

app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: prismicApiEndpoint,
    linkResolver: handlelinkResolver,
  };

  res.locals.PrismicDOM = PrismicDOM;
  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('pages/home');
});

app.get('/about', (req, res) => {
  initPrismicApi(req).then((api) => {
    api.query(Prismic.Predicates.any('document.type', ['about', 'metadata'])).then((response) => {
      const { results } = response;
      const [about, metadata] = results;
      res.render('pages/about', {
        about,
        metadata,
      });
    });
  });
});

app.get('/collections', (req, res) => {
  res.render('pages/collections');
});

app.get('/detail/:id', (req, res) => {
  res.render('pages/detail');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
