import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';

const activities = [
    { id: 1, user: 'Sagar Kumar', action: 'registered a new student', time: '5 mins ago', type: 'new' },
    { id: 2, user: 'Admin', action: 'updated Course "Digital Literacy"', time: '2 hours ago', type: 'update' },
    { id: 3, user: 'Rina Devi', action: 'completed Module 3', time: '1 day ago', type: 'complete' },
    { id: 4, user: 'Admin', action: 'added a new Centre in Delhi', time: '2 days ago', type: 'new' },
    { id: 5, user: 'Priya Sharma', action: 'submitted an assessment', time: '3 days ago', type: 'submit' },
];

const getBadgeVariant = (type) => {
    switch (type) {
        case 'new': return 'primary';
        case 'update': return 'warning';
        case 'complete': return 'success';
        case 'submit': return 'info';
        default: return 'secondary';
    }
};

export default function RecentActivityTable() {
    return (
        <Card className="shadow-sm">
            <Card.Header as="h5">Recent Activity</Card.Header>
            <Card.Body>
                <Table responsive hover className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity) => (
                            <tr key={activity.id}>
                                <td>{activity.user}</td>
                                <td>
                                    <Badge bg={getBadgeVariant(activity.type)} className="me-2">{activity.type}</Badge>
                                    {activity.action}
                                </td>
                                <td className="text-muted">{activity.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
}