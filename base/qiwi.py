from glQiwiApi import QiwiWrapper


SECRET_KEY = 'eyJ2ZXJzaW9uIjoiUDJQIiwiZGF0YSI6eyJwYXlpbl9tZXJjaGFudF9zaXRlX3VpZCI6ImRzaXB0OC0wMCIsInVzZXJfaWQiOiI3OTE4NzE4ODAwOCIsInNlY3JldCI6IjAzZWJhNzE2YjI3ZTAyNTgzYjMyNDQzMGE1Mzk0Mjg5Zjc4MDBkMmU1MzVkYjBiNTM5NzJmNDcyOTc1M2JmYWQifX0='
PUBLIC_KEY = '48e7qUxn9T7RyYE1MVZswX1FRSbE6iyCj2gCRwwF3Dnh5XrasNTx3BGPiMsyXQFNKQhvukniQG8RTVhYm3iPqray6nGhuYHn44BxyaFSeEM1HGhX33VR2TVEX5PdK68xZRBkvzTYrMJXrMG9vAqh677vT46dHMnJTo3P7JQBN1eejV8fEyqc9da1hBH9R'


async def create_link_to_pay(price: int):
    async with QiwiWrapper(secret_p2p=SECRET_KEY) as w:
        bill = await w.create_p2p_bill(
            amount=price,
            comment='Оплата услуг Let\'s EAT!'
        )
        # await w.create_p2p_bill()
        return {
            'pay_url': bill.pay_url,
            'bill': bill
        }


async def check_pay(bill_id: str):
    async with QiwiWrapper(secret_p2p=SECRET_KEY) as w:
        status = (await w.check_p2p_bill_status(
            bill_id=bill_id
        )) == 'PAID'
        return status


async def cancel_pay(bill_id):
    async with QiwiWrapper(secret_p2p=SECRET_KEY) as w:
        pay = await w.reject_p2p_bill(bill_id)
        return pay
