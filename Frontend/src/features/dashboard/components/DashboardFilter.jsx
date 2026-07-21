import React, { useState } from "react";
import { FaSearch, FaRedo } from "react-icons/fa";
import { Form, Button, Row, Col, Card } from "react-bootstrap";

// Dummy data - baad me API se aayega
const dummyStates = ["West Bengal", "Tamil Nadu", "Delhi", "Maharashtra"];
const dummyDistricts = ["District 1", "District 2", "District 3"];
const dummyCentres = ["Centre 1", "Centre 2", "Centre 3"];

export default function DashboardFilter() {
    const [state, setState] = useState("");
    const [district, setDistrict] = useState("");
    const [centre, setCentre] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const handleSearch = () => {
        console.log({ state, district, centre, fromDate, toDate });
    };

    const handleReset = () => {
        setState("");
        setDistrict("");
        setCentre("");
        setFromDate("");
        setToDate("");
    };

    return (
        <Card className="shadow-sm">
            <Card.Header as="h5">Filters</Card.Header>
            <Card.Body>
                <Form>
                    <Row className="g-3 align-items-end">
                        <Col md>
                            <Form.Group controlId="stateFilter">
                                <Form.Label>State</Form.Label>
                                <Form.Select value={state} onChange={(e) => setState(e.target.value)}>
                                    <option value="">Select State</option>
                                    {dummyStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md>
                            <Form.Group controlId="districtFilter">
                                <Form.Label>District</Form.Label>
                                <Form.Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                                    <option value="">Select District</option>
                                    {dummyDistricts.map((d) => (<option key={d} value={d}>{d}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md>
                            <Form.Group controlId="centreFilter">
                                <Form.Label>Centre</Form.Label>
                                <Form.Select value={centre} onChange={(e) => setCentre(e.target.value)}>
                                    <option value="">Select Centre</option>
                                    {dummyCentres.map((c) => (<option key={c} value={c}>{c}</option>))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md>
                            <Form.Group controlId="fromDateFilter">
                                <Form.Label>From Date</Form.Label>
                                <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md>
                            <Form.Group controlId="toDateFilter">
                                <Form.Label>To Date</Form.Label>
                                <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col md="auto" className="d-flex">
                            <Button variant="primary" onClick={handleSearch} className="me-2 d-flex align-items-center">
                                <FaSearch size={12} className="me-2" /> Search
                            </Button>
                            <Button variant="outline-secondary" onClick={handleReset} className="d-flex align-items-center">
                                <FaRedo size={12} className="me-2" /> Reset
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}