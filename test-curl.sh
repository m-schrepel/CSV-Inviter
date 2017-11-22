curl -X POST \
  http://localhost:9991?onboardingId=5d286e6b-afec-4503-bfc4-78d10bfb2991 \
  -H  'Host: sandbox.tradeshift.com' \
		-H 'User-Agent: DDMagicScript/1.0' \
		-H 'Accept: text/plain' \
		-H 'Accept-Language: en-GB,en-US;q=0.8,en;q=0.5,da;q=0.3' \
		-H 'Content-Type: application/json' \
		-H 'X-Tradeshift-Remote-Component-ID: TradeshiftDD.DDManager.Main 1.0.0-848876f682f9f0ad966083b445c32907' \
		-H 'X-Tradeshift-Remote-HTTP-Method: post' \
		-H 'X-Tradeshift-Remote-Service-Key: provider' \
		-H 'X-Requested-With: XMLHttpRequest' \
		-H 'Referer: https://sandbox.tradeshift.com/ts3/frame/1095761275' \
		-H 'Cookie: TSAPPID=90769707; test=1; csrfToken=Ix9uAP_cOyS00PWcxT6wzF4cwQ37YoOL32pqRpRF1Cc=; JSESSIONID=B20B22D1DA2FFCFFA15BA69E8893FA69;' \
		-H 'DNT: 1' \
		-H 'Connection: keep-alive' \
		--data '{
			    "deleted":false,
							"fundingRate":22,
							"settlementPeriod":45,
							"status":"DRAFT",
							"supplierCompanyAccountId":"077642e5-7694-4449-9eaf-06be48dc4a91",
							"supplierEmail":"cle+skwsupplier@tradeshift.com",
							"fromEmail":"",
							"properties":{},
							"skipContractReview":false,
							"programIds":["23177f19-0ac8-4e66-b24c-5ce0e61f0eb1"]
		}' \
		-v  
