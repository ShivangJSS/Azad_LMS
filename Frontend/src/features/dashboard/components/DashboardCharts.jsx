import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const ChartCard = ({ title, children }) => (
    <Card className="shadow-sm h-100">
        <Card.Header as="h5">{title}</Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '250px' }}>
            {children}
        </Card.Body>
    </Card>
);

export default function DashboardCharts() {
    return (
        <Row className="g-4">
            <Col lg={6}>
                <ChartCard title="Enrollment Trends">
                    <div className="text-center">
                        <p className="fs-4">📊</p>
                        <p>Chart placeholder</p>
                    </div>
                </ChartCard>
            </Col>
            <Col lg={6}>
                <ChartCard title="Course Completion Rates">
                    <div className="text-center">
                        <p className="fs-4">📈</p>
                        <p>Chart placeholder</p>
                    </div>
                </ChartCard>
            </Col>
        </Row>
    );
}