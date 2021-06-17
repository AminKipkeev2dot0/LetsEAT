from glQiwiApi import QiwiWrapper
from environs import Env

env = Env()
env.read_env()

SECRET_KEY = env.str("QIWI_SECRET_KEY")
PUBLIC_KEY = env.str("QIWI_PUBLIC_KEY")


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
