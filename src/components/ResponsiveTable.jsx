// components/ResponsiveTable.jsx
import { Card, Grid, Space } from "antd";
import { Table } from "antd";

const { useBreakpoint } = Grid;

const ResponsiveTable = ({ columns, dataSource, rowKey = "key", ...restProps }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return isMobile ? (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      {dataSource.map((record) => (
        <Card
          key={record[rowKey]}
          style={{
            borderRadius: 12,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {columns.map((col) => {
            if (col.responsive && !col.responsive.includes("xs")) return null;

            const value = col.render
              ? col.render(record[col.dataIndex], record, dataSource.indexOf(record))
              : record[col.dataIndex];

            return (
              <div
              className="mobile-table"
                key={col.key || col.dataIndex}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <span style={{ fontWeight: 500, color: "#555" }}>{col.title}</span>
                <span>{value}</span>
              </div>
            );
          })}
        </Card>
      ))}
    </Space>
  ) : (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      {...restProps}
    />
  );
};

export default ResponsiveTable;
