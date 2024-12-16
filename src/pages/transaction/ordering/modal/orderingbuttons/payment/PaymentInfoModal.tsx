import { Modal } from "antd"



interface PaymentInfoModalProps {
    isOpen: boolean
    info: {
        total: string | undefined | 0,
        change: string,
        paid: string
    }
    closeModal: () => void
}


export const PaymentInfoModal = ({isOpen, info, closeModal}: PaymentInfoModalProps) => {

    return (
        <>
            <Modal open={isOpen} onClose={()=> closeModal()} onCancel={closeModal} footer={null} title="Payment Information">
                <div className="text-5xl pointer-events-none">
                    <div className="flex justify-between">
                        <span>PAID: ₱{info.paid}</span>
                    </div>
                    <div className="flex justify-betwee text-rose-500">
                        <span>TOTAL: ₱{info.total}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span>CHANGE: ₱{info.change}</span>
                    </div>
                </div>
            </Modal>
        </>
    )
}