import { Router } from 'express';
var router = Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('findslopeforparcel', { title: 'Steep Slope Calculator' });
});


export default router;
