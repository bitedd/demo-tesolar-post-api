const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
/*
 * 예외처리를 간략히 표현, 위 표현을 사용하지 않으면 
 * 모든 에러 처리 코드에 아래 형태로 컨트롤러단에 중복 코드가 만들어진다.
 try {

 } catch (err) {

 }

 */

module.exports = asyncHandler;
