import React, {FunctionComponent, ReactComponentElement, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

export const AccountModal: FunctionComponent<{}> = (props) =>  {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Welcome! You're on chain!</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="alert" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Let's Game
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
}