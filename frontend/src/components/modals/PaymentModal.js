import Modal from "react-bootstrap/Modal";
import Payment from "../payment/forms/Payment";

const PaymentModal = (props) => {
  return (
    <Modal
      show={props.show}
      onHide={props.onClose}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Checkout &ndash; Demo Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Payment cart={props.cart} onClose={props.onClose} />
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;