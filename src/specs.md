# 테솔라 운송 시스템 API
테솔라 운송 시스템은 택배 물품 발송 고객의 물품을 접수하여, 택배 물품 수령인에게 전달하는 것을 목적으로 하는 시스템이다. 택배 물품은 택배회사 직원이 접수하고, 택배회사 배달원이 배달하게 된다.

이 시스템에서는 택배지점이나 택배 회사 지점은 존재하지 않으며, 논리적으로 세개의 액터에 대한 구현만 되어있다.

## 유저 종류(role)

#### 고객(customer)
 * 운송 시스템을 이용하는 고객이다.

#### 택배회사직원(officer)
 * 고객의 물품을 접수하고, 물품을 보관하고 배달원에게 전달한다.

#### 택배 배달원(postman)
 * 배달은은 고객의 물품을 받는 사람의 주소까지 전달한다.

## 택배 물품 관리 이벤트 정보
 * 접수(recepted)
 * 대기(standby)
 * 배달중(on delivery)
 * 배달완료(delivered)

## 택배 물품 종류
 * 전자기기(electronics)
 * 잡화(stuff)
 * 음식(food)
 * 가구(furniture)


## 구현 내용
 * 페이징 조회
 * Filtering 조회
 * geocoder를 이용한 위치를 기반으로한 조회
 * Role-based access controls
 * 사진 업로드 
 * JWT 토큰 인증
   * 10일 초과시 expired
 * 암호 재설정을 위해 일정시간만 유효한 토큰 생성기능  
 * 스테이지 환경에 따른 동작 변경
   * 로그출력 포맷
   * cookie 관련 보안설정(secure)
 * 에러 핸들링을 위한 커스텀 핸들러
 * 보안 기능
   * XSS 방지
   * NoSQL injections 방지
   * rate limit 5분동안 100 리퀘스트
   * http param polution 방지
 * 메일전송 (MailTrap 이용)

 