import Epona from 'eponajs';

let epona = new Epona({ concurrent: 10 })
epona
  .on('iqiyi.com/v_', {
    vid: ['#videoShopGuideWrap::data-shop-albumid', '#widget-qiyu-zebra::data-qiyu-albumid']
  })
  .type('html')
  .then((parsedBody, topicId) => {
    console.log(parsedBody);
    console.log(topicId);
  })
  .catch((error) => {
    console.error(error);
  })

export { epona as IqiyiParser }