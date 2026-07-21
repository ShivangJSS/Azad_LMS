import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { FaUsers, FaBook, FaLayerGroup, FaUniversity } from 'react-icons/fa';

const stats = [
    { title: 'Total Students', value: '1,250', icon: <FaUsers size={32} />, color: 'text-primary' },
    { title: 'Total Courses', value: '48', icon: <FaBook size={32} />, color: 'text-success' },
    { title: 'Active Batches', value: '12', icon: <FaLayerGroup size={32} />, color: 'text-info' },
    { title: 'Total Centres', value: '8', icon: <FaUniversity size={32} />, color: 'text-danger' },
];

const StatCard = ({ title, value, icon, color }) => (
    <Card className="shadow-sm h-100">
        <Card.Body>
            <div className="d-flex align-items-center">
                <div className={`flex-shrink-0 me-3 ${color}`}>
                    {icon}
                </div>
                <div className="flex-grow-1">
                    <p className="text-muted mb-1">{title}</p>
                    <h4 className="mb-0">{value}</h4>
                </div>
            </div>
        </Card.Body>
    </Card>
);

export default function StatsCards() {
    return (
        <Row xs={1} sm={2} lg={4} className="g-4">
            {stats.map((stat) => (
                <Col key={stat.title}>
                    <StatCard {...stat} />
                </Col>
            ))}
        </Row>
    );
}